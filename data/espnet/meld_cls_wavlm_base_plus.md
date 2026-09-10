# espnet/meld_cls_wavlm_base_plus

## Resumen

El modelo `espnet/meld_cls_wavlm_base_plus` es un clasificador de audio de nivel de enunciado desarrollado por el equipo de ESPnet y publicado en HuggingFace bajo el identificador de autor `espnet`. Se trata de un paquete de inferencia generado a partir de la receta `egs3/meld/cls`, entrenado sobre el corpus MELD, y empaquetado con la clase `ESPnetClassificationModel`. No es un modelo generativo ni un modelo de lenguaje: es un cabezal de clasificación supervisada que recibe una señal de audio y produce una etiqueta de clase.

Tecnicamente combina un frontend preentrenado de representacion de voz (WavLM Base+ a traves de la libreria s3prl, con extraccion de caracteristicas multicapa) con un encoder transformer pequeno de 4 bloques y dimension oculta 128, seguido de un decodificador lineal. El conjunto suma 95.801.220 parametros en `torch.float32`, lo que ocupa 383,2 MB, y esta pensado para ejecutarse en hardware muy modesto.

Su relevancia es acotada y muy especifica: sirve como punto de partida reproducible para investigacion en reconocimiento de emociones o estados afectivos en conversaciones, y como componente de analitica de audio en pipelines de produccion donde se necesite etiquetar turnos de habla cortos (de 0,1 a 20 segundos) a 16 kHz. Los resultados publicados son moderados (AUC 70,05 y MacroF1 26,17 en test), lo que refleja la dificultad del corpus y un fuerte desequilibrio de clases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador ESPnet (`ESPnetClassificationModel`): frontend s3prl con upstream WavLM Base+ y extraccion multicapa, encoder transformer de 4 bloques (d=128, 4 cabezas, 1024 unidades lineales, dropout 0,4) y decoder lineal |
| Parametros totales | 95.801.220 (100 % aprendibles segun la model card); 383,2 MB |
| Longitud de contexto | no aplica (modelo de clasificacion de audio; entradas de 0,1 a 20 s a 16 kHz, normalizadas con `utterance_mvn`) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `torch.float32`, 100 % del total) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el corpus MELD contiene conversaciones en ingles) |
| Licencia | no disponible |
| Formato de pesos | checkpoint de PyTorch dentro de un bundle de ESPnet3 (`model_pack`); no se ofrecen safetensors ni GGUF |
| Corpus de entrenamiento | MELD |
| Receta / sistema | `egs3/meld/cls` / `cls` |
| Tipo de clasificacion | `multi-class` |
| Tamano del repositorio | 0,4 GB |
| Fecha de creacion (segun metadatos) | 2026-09-10 |
| Descargas / likes en HuggingFace | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un pipeline de tres etapas. En primer lugar, un frontend `s3prl` con el upstream `wavlm_base_plus` configurado con `multilayer_feature: true`, es decir, se combinan representaciones de varias capas del modelo preentrenado en lugar de usar solo la ultima. La configuracion declara `freeze_param: [frontend.upstream]`, de modo que el extractor WavLM se mantiene congelado durante el entrenamiento y solo se optimiza la parte posterior; conviene senalar que la model card indica simultaneamente que el 100 % de los parametros son aprendibles, una discrepancia entre el resumen de parametros y la configuracion de entrenamiento. Despues, un encoder transformer de 4 bloques con `output_size: 128`, 4 cabezas de atencion, 1024 unidades lineales e `input_layer: linear` procesa las caracteristicas. Finalmente, un decoder lineal proyecta la representacion a las clases.

El entrenamiento se realizo con `espnet2.tasks.cls.CLSTask`, optimizador Adam con `lr: 0.001` y `weight_decay: 0`, scheduler `WarmupLR` con 3180 pasos de calentamiento, `max_epochs: 30`, recorte de gradiente de 5,0 y early stopping con paciencia 5 monitorizando `valid/acc`. Los lotes se formaron con `batch_size: 32` y `batch_bins: 4.000.000`. El preprocesado fija `fs: 16000`, filtra el audio fuera del rango 0,1-20 s y trabaja con etiquetas a nivel de palabra (`token_type: word`, con `<unk>:-1`). No se documenta en la informacion disponible ninguna fase de RLHF, DPO ni ajuste por preferencias, algo por otra parte esperable en un clasificador discriminativo. Tampoco se detalla el numero de tokens o de horas de audio empleadas mas alla del propio corpus MELD.

## Capacidades

- Clasificacion de audio de nivel de enunciado: asigna una etiqueta a cada segmento de voz de entre 0,1 y 20 segundos a 16 kHz, con un unico tipo de clasificacion multiclase.
- Extraccion de representaciones de voz: el frontend WavLM Base+ con features multicapa captura informacion acustica y prosodica util para tareas afectivas o paralinguisticas.
- Inferencia por API sencilla: se carga con `espnet3.publication.InferenceModel.from_pretrained(..., trust_user_code=True)` y se invoca directamente sobre una muestra de audio.
- Integracion con el ecosistema ESPnet2/ESPnet3 y s3prl, lo que facilita su reutilizacion como inicializacion en otras recetas de clasificacion.
- Capacidad de servir como extractor de caracteristicas congelado para tareas posteriores de analisis conversacional.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision, audio generativo, tool calling, function calling, modo pensamiento ni capacidades de agente. Cualquier uso en esos ambitos esta fuera del alcance del modelo.
- No se declaran capacidades multilingues ni una lista de etiquetas soportadas en la informacion proporcionada.

## Casos de uso

- Analitica de emociones en centros de atencion al cliente: el modelo clasifica cada turno de habla de una llamada grabada y permite construir series temporales de estado afectivo por interlocutor. Es adecuado porque acepta segmentos de hasta 20 segundos, que cubren la mayoria de turnos de una conversacion telefonica.
- Enrutado inteligente de llamadas en tiempo real: clasificando la primera intervencion del cliente se puede derivar la llamada a un agente especializado o a un flujo de retencion. Su reducido tamano (383,2 MB en fp32) hace viable ejecutarlo junto al sistema de telefonia.
- Etiquetado automatico de corpus para entrenar modelos posteriores: sirve como preanotador de grandes volumenes de audio, generando etiquetas que despues se revisan y se usan para entrenar modelos multimodales texto-audio.
- Investigacion academica en reconocimiento de emociones en conversacion: al estar empaquetado con la receta `egs3/meld/cls` y publicar resultados de validacion y test, permite reproducir y comparar variantes arquitectonicas sobre el mismo corpus.
- Monitorizacion de calidad en reuniones o sesiones de soporte grabadas: la metrica de estado por turno puede agregarse para detectar sesiones con evolucion negativa y activar revisiones de calidad.
- Analisis de contenido en plataformas de audio: clasificacion de clips cortos para moderacion o catalogacion tematica, aprovechando la tolerancia a segmentos desde 0,1 segundos.
- Componente de un sistema de analisis de interaccion humana mas amplio: sus embeddings intermedios (transformas de 128 dimensiones) pueden alimentar clasificadores auxiliares de turnos, ya que el modelo expone una representacion compacta y ligera.

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Dataset | AUC | MacroF1 | UA | WA | mAP |
|---|---|---|---|---|---|
| test | 70,05 | 26,17 | 25,44 | 52,72 | 28,3 |
| valid | 69,57 | 26,07 | 26,07 | 48,55 | 30,45 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible, por lo que no se ofrece una tabla de comparacion de metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1,5 GB en `torch.float32` (383,2 MB de pesos mas activaciones). Con cuantizacion no hay datos, porque no se publican variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una NVIDIA RTX 3060, RTX 4090, A100 o H100 queda sobradamente dimensionada. Tambien es viable la inferencia en CPU para volumenes moderados.
- Cabe en GPU de consumo: si, en practicamente cualquier tarjeta grafica de consumo de los ultimos diez anos, e incluso en sistemas embebidos o mini-PC con CPU moderna.
- Opciones de despliegue: API de ESPnet3 (`espnet3.publication.InferenceModel`), stack ESPnet2 (`espnet2.tasks.cls.CLSTask`) y PyTorch, con s3prl como dependencia para el frontend WavLM. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje y no se distribuye en formatos compatibles.
- Latencia y throughput estimados: no disponible. El coste computacional esta dominado por el extractor WavLM Base+ (12 capas transformer) mas que por el encoder de clasificacion, que es muy pequeno.
- Nota de seguridad: la carga requiere `trust_user_code=True`, lo que implica ejecutar codigo del repositorio; debe revisarse antes de usarlo en entornos productivos.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. La model card no incluye comparaciones con otras variantes de la receta `meld/cls` ni con clasificadores alternativos, y la busqueda web no devolvio resultados tecnicos relevantes sobre este modelo. Por tanto, la comparativa de parametros, contexto, rendimiento, licencia y disponibilidad se considera no disponible.

## Limitaciones y advertencias

- Rendimiento bajo en metricas macro: MacroF1 26,17 y UA 25,44 en test. Un WA de 52,72 frente a una UA de 25,44 apunta a un fuerte sesgo hacia las clases mayoritarias, con clases minoritarias practicamente sin detectar.
- Licencia no disponible: sin una licencia explicita no puede asumirse permiso para uso comercial. Es imprescindible contactar con el autor antes de desplegarlo en produccion.
- Idiomas no declarados: el corpus MELD contiene conversaciones en ingles; no hay evidencia de que el modelo funcione correctamente en castellano u otras lenguas.
- Dominio restringido: entrenado sobre MELD, un corpus de dialogos de una serie de television estadounidense. La transferencia a llamadas telefonicas, audio de campo o voces no nativas no esta evaluada.
- Longitud de entrada acotada: el preprocesado filtra audios fuera del rango 0,1-20 s, por lo que clips mas largos deben segmentarse antes de la inferencia.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto; el riesgo equivalente es la asignacion de etiquetas incorrectas con alta confianza, especialmente en clases poco representadas.
- Sesgos potenciales: los derivados del corpus de entrenamiento (voces de actores, guiones, distribucion de genero y edad, contexto cultural estadounidense) y los del propio modelo preentrenado WavLM.
- Discrepancia documental: la configuracion declara `freeze_param: [frontend.upstream]` mientras que el resumen indica que el 100 % de los parametros son aprendibles; conviene verificar que pesos se congelan realmente al reentrenar.
- Dependencia de librerias: requiere ESPnet3 y s3prl, y la carga exige `trust_user_code=True`, lo que anade superficie de riesgo en entornos productivos.
- Cero traccion en HuggingFace (0 descargas, 0 likes) en el momento de la consulta, lo que limita la validacion independiente por parte de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/espnet/meld_cls_wavlm_base_plus
- Repositorio de origen declarado en la model card: https://github.com/itoten/espnet.git (rama `recipe/meld-cls-espnet3`, commit `322d199a02`)
- Paper de ESPnet: Watanabe et al., "ESPnet: End-to-End Speech Processing Toolkit", Interspeech 2018, paginas 2207-2211, DOI 10.21437/Interspeech.2018-1456
- Toolkit ESPnet: https://github.com/espnet/espnet
- Toolkit s3prl (frontend y upstream WavLM): https://github.com/s3prl/s3prl
- Corpus MELD: no se proporciona enlace en la informacion disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; unicamente aparecieron paginas del test de velocidad de Ookla, sin relacion con el contenido de la ficha.
