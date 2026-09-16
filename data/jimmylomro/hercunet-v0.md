# jimmylomro/hercunet-v0

## Resumen

HercUNet v0 es un modelo de segmentación 3D para detectar las superficies mediales (hojas o *sheets*) de papiro enrollado en rollos carbonizados de Herculano a partir de tomografías de rayos X (µCT). Lo desarrolla jimmylomro y se publica en HuggingFace como un *trained-model folder* estándar de nnU-Net, con pesos en `fold_0/checkpoint_best.pth` y `fold_0/checkpoint_latest.pth`. No es un modelo de lenguaje: su entrada es un volumen de TC y su salida es una máscara de superficie.

Técnicamente es un refiner iterativo `D(CT, prev) → surface` construido sobre una U-Net residual (configuración `nnUNetResEncUNetLPlans`), inicializado a partir del detector de superficies m7 de ScrollPrize y entrenado con pseudoetiquetas ∇φ de etapa 1 más un corpus de *rehearsal* minado de m7. El entrenamiento combina AffinityMalis con *online DAgger* durante 500 épocas (`nnUNetTrainer_AffinityMalis_IterDagger_500epochs`, `K=4` canales candidatos).

Su relevancia es de nicho pero muy concreta: forma parte de la cadena de *virtual unwrapping* de los rollos de Herculano, donde localizar correctamente las superficies de papiro es el paso previo imprescindible para leer texto sin abrir el rollo. El repositorio pesa 1,6 GB y no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net residual 3D tipo nnU-Net (`nnUNetResEncUNetLPlans`) con *stem* ampliado y cabeza de *affinity*; refiner iterativo autoalimentado |
| Parametros totales | no disponible |
| Longitud de contexto | no aplica (modelo de segmentacion volumetrica; el campo receptivo depende del tamano de parche configurado en `plans.json`, no disponible) |
| Tipos de cuantizacion | no disponible (se publican pesos PyTorch en coma flotante; no hay variantes GGUF, AWQ ni similares) |
| Idiomas soportados | no aplica (modelo de vision/segmentacion, no linguistico) |
| Licencia | no disponible en la model card; se remite a la licencia del repositorio de GitHub |
| Formato de pesos | PyTorch `.pth` (checkpoint de nnU-Net: `checkpoint_best.pth`, `checkpoint_latest.pth`) |
| Modalidad de entrada | Volumen de TC de rayos X (µCT) de rollos de papiro carbonizados |
| Modalidad de salida | Mascara de segmentacion 3D con etiquetas `{background:0, surface:1, ignore:2}` |
| Canales de entrada declarados | 5 en `plans.json` (CT + 4 crestas candidatas/previas); el *trainer* construye un *stem* de 8 canales `[CT, prev, orientation×6]` segun el README |
| Entrenador | `nnUNetTrainer_AffinityMalis_IterDagger_500epochs`, `K=4` canales candidatos |
| Formato de datos de entrenamiento | Tiff3DIO |
| Tamano del repositorio | 1,6 GB |
| Autor | jimmylomro |
| Fecha de publicacion | 2026-09-16 |

## Arquitectura y entrenamiento

La base es una U-Net residual 3D de nnU-Net en configuracion `L`, descrita en `plans.json` como `nnUNetResEncUNetLPlans` y parcheada a 5 canales de entrada (el TC mas cuatro crestas candidatas o previas). Segun el README, el *trainer* no construye una ResEncUNet plana: genera un *stem* de 8 canales `[CT, prev, orientation×6]` y anade una cabeza de *affinity*. La inferencia es iterativa: la salida softmax de la pasada anterior se realimenta como canal `prev` y se combina mediante un *blend* tipo Jacobi. El modelo es la version v0, correspondiente al *run301*.

El entrenamiento parte de los pesos del detector de superficies m7 de ScrollPrize (*warm start*) y se afina con pseudoetiquetas ∇φ de etapa 1 mas un corpus de *rehearsal* minado de m7, dentro de un esquema AffinityMalis con *online DAgger*. El numero de epocas es 500. La receta exacta de hiperparametros se publica en `hercunet/recipes/hercunet.yml`. No se especifican en la informacion disponible el numero de tokens/volumenes de entrenamiento, la composicion detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un modelo de segmentacion).

## Capacidades

- Deteccion de superficies mediales (hojas) de papiro en rollos carbonizados a partir de µCT.
- Refinamiento iterativo: acepta la prediccion previa como canal de entrada y mejora la mascara en pasadas sucesivas.
- Segmentacion semantica 3D con tres clases (fondo, superficie, ignorar).
- Prediccion de mapas de *affinity* ademas de la segmentacion.
- Condicionamiento por orientacion: incorpora seis canales de orientacion en el *stem* del *trainer*.
- Reentrenamiento y ajuste fino: el checkpoint puede cargarse con `--pretrained-hf` para *warm start*, reentrenamiento o *fine-tuning*.
- Generacion de pseudoetiquetas dentro de un pipeline tipo DAgger.
- No soporta *tool calling*, agentes, razonamiento multi-paso, vision general ni capacidades multilingues: es un modelo especializado de un unico dominio.

## Casos de uso

- Reconstruccion virtual de rollos de Herculano: detectar las hojas de papiro en el volumen de µCT es el paso previo al *unwrapping* y a la lectura del texto sin abrir el rollo; el modelo esta disenado especificamente para esa tarea.
- Segmentacion de superficies en escaneos de nuevos rollos: aplicar el checkpoint a un volumen de µCT para obtener la mascara de superficies que alimentara las etapas posteriores de *flattening* y deteccion de tinta.
- *Warm start* de modelos propios: usar `--pretrained-hf jimmylomro/hercunet-v0` para inicializar un entrenamiento con un dataset propio y aprovechar el conocimiento aprendido sobre papiro carbonizado.
- *Fine-tuning* con datos anotados de un escaneo concreto: ajustar el modelo a las caracteristicas de un solo rollo o de un unico escaner para reducir el error de dominio.
- Generacion de pseudoetiquetas para *online DAgger*: emplear las predicciones del modelo como etiquetas provisionales que un anotador o un paso posterior corrigen, alimentando la siguiente ronda de entrenamiento.
- *Baseline* de investigacion en segmentacion volumetrica: servir como punto de partida reproducible para comparar variantes de arquitectura, canales de entrada o estrategias iterativas en el dominio del patrimonio cultural.
- Auditoria y mejora del detector m7: dado que el modelo deriva de m7 y se entrena con *rehearsal* de ese detector, permite estudiar donde la iteracion aporta mejoras o donde hereda errores.
- Integracion en pipelines de la ScrollPrize: encadenar la salida de superficies con las herramientas de la competicion para la lectura automatica de los rollos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. No se publican requisitos de memoria ni tamanos de lote.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no hay datos que confirmen que quepa en una GPU consumer.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, porque no es un modelo de lenguaje. El despliegue requiere el codigo de `hercunet`; el README advierte explicitamente de que `nnUNetv2_predict` de nnU-Net estandar construye una red incorrecta y no debe usarse.
- Latencia y throughput: no disponible. Al ser inferencia iterativa (varias pasadas realimentadas), el coste depende del numero de iteraciones configurado, dato no publicado.
- Almacenamiento: el repositorio ocupa 1,6 GB e incluye `checkpoint_best.pth`, `checkpoint_latest.pth`, `plans.json`, `dataset.json`, `dataset_fingerprint.json`, registros de entrenamiento y `progress.png`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto/entrada | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| HercUNet v0 (run301) | U-Net residual 3D iterativa con cabeza de *affinity* | no disponible | Volumen µCT con canales CT y previos | no disponible (ver repositorio GitHub) | HuggingFace, 1,6 GB, 0 descargas | no disponible |
| ScrollPrize m7 (detector de superficies) | Detector de superficies de referencia | no disponible | Volumen µCT | no disponible | Usado como *warm start* y fuente de *rehearsal* | no disponible |
| nnU-Net ResEncUNet L generico | U-Net residual 3D supervisada | no disponible | Parche 3D con canales definidos por el dataset | Apache-2.0 en el framework nnU-Net (no confirmado para este checkpoint) | Publico como framework | No comparable: depende del dataset |

No se dispone de datos numericos que permitan una comparacion cuantitativa entre estas alternativas.

## Limitaciones y advertencias

- Inferencia no estandar: el checkpoint es cargable, pero ejecutarlo requiere el codigo de `hercunet`; `nnUNetv2_predict` construye una red distinta de forma silenciosa.
- Discrepancia documentada: `plans.json` declara 5 canales de entrada mientras el README describe un *stem* de 8 canales en el *trainer*. Hay que respetar el codigo, no el JSON, para reproducir la inferencia.
- Dominio muy restringido: solo rollos de papiro carbonizado de Herculano escaneados con µCT. No hay evidencia de transferencia a otras modalidades de imagen ni a otros materiales.
- Sesgos heredados: al inicializarse desde m7 y entrenarse con pseudoetiquetas ∇φ y *rehearsal* de m7, el modelo puede reproducir los errores sistematicos de ese detector.
- Riesgo de alucinacion estructural: en zonas de baja relacion senal-ruido o con hojas muy comprimidas, la red puede generar superficies plausibles pero inexistentes en el volumen; conviene validacion con expertos.
- Licencia no aclarada en la model card: la ficha remite a la licencia del repositorio de GitHub, por lo que el uso comercial queda indeterminado hasta consultarla.
- Sin validacion externa publica: 0 descargas y 0 valoraciones, y ausencia de benchmarks en la informacion disponible.
- Version v0: se trata de un modelo inicial, no de una version estable ni validada en produccion.
- Sin soporte linguistico, de agentes ni de *tool calling*: cualquier expectativa en ese sentido es inaplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jimmylomro/hercunet-v0
- Repositorio de codigo y documentacion: https://github.com/jimmylomro/hercUNet
- Corpus de entrenamiento: https://huggingface.co/datasets/jimmylomro/hercunet-corpus
- Documentacion de entrenamiento: https://github.com/jimmylomro/hercUNet/blob/main/docs/training.md
- Receta de hiperparametros (run301): https://github.com/jimmylomro/hercUNet/blob/main/hercunet/recipes/hercunet.yml
