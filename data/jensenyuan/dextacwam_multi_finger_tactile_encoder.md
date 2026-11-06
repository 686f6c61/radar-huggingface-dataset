# JensenYuan/DexTacWAM_multi_finger_tactile_encoder

## Resumen

DexTacWAM multi-finger tactile encoder es el codificador táctil del sistema DexTacWAM, un modelo mundo-acción viso-táctil para manipulacion diestra desarrollado por Haoran Yuan y colaboradores (entre ellos Trevor Darrell y Wei Zhan). Su funcion es mapear las senales tactiles por dedo procedentes de dos manos diestras Sharpa Wave al espacio latente visual del VAE de LTX-Video, de modo que el modelo mundo pueda atender de forma conjunta sobre el tacto y la vision en una unica representacion.

El artefacto publicado es el de la etapa 1 del pipeline DexTacWAM: un adaptador tipo finger-set-transformer acoplado a un tronco VAE de LTX-Video congelado. Solo se entrena el adaptador; los pesos del VAE nunca se actualizan. Todos los modelos mundo y expertos de accion de DexTacWAM cargan su rama tactil desde estos pesos, lo que convierte este checkpoint en una pieza fundacional del sistema completo.

El modelo es relevante porque resuelve un problema concreto de la manipulacion robotica diestra: alinear senales tactiles de alta dimension (dos manos, cinco dedos) con el espacio latente de un modelo generativo de video, habilitando politicas que razonan sobre contacto fisico y vision simultaneamente. El repositorio ocupa 0,9 GB y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador finger-set-transformer sobre tronco VAE de LTX-Video congelado (VisualVAEAdapterModel) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas temporales de video; horizonte de prediccion T=1 a T=9) |
| Tipos de cuantizacion | no disponible (checkpoint en bfloat16) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (`model.pt`, dict con state dict, config y metadatos de seleccion) |

## Arquitectura y entrenamiento

El codificador es un adaptador de tipo finger-set-transformer que proyecta senales tactiles por dedo al espacio latente visual del VAE de LTX-Video. La entrada tactil tiene forma `(2, 5, 192, 256)` en uint8 (dos manos, cinco dedos) junto con una pose de mano de 22 dimensiones. El tronco VAE permanece congelado durante todo el entrenamiento; solo se actualizan los pesos del adaptador. En la segunda fase se incorpora inyeccion de pose y una cabeza temporal TimeSformer, inicializada a cero para que el paso 0 reproduzca exactamente el comportamiento del entrenamiento base.

El entrenamiento se realizo en dos ejecuciones sobre el conjunto `488_diverse_episodes` (488 episodios, 3,5 horas, 464 para entrenamiento). La primera, de 30.000 pasos, entrena el adaptador desde cero con una cabeza auxiliar de pose (`lambda_pose=0.1`). La segunda, de 60.000 pasos, arranca en caliente desde el paso 30.000 de la primera, anade inyeccion de pose y la cabeza temporal TimeSformer, y desactiva la perdida de pose. El checkpoint publicado se selecciono por `val_recall_post_mean` en el paso 53.000. Reproducirlo requiere ambas configuraciones, en ese orden. Las cabezas auxiliares de flujo y pose solo se usan en entrenamiento y no se reconstruyen al cargar el modelo.

## Capacidades

- Codificacion de senales tactiles multi-dedo: procesa entradas de dos manos con cinco dedos cada una, en formato `(2, 5, 192, 256)` uint8.
- Proyeccion al espacio latente visual: alinea el tacto con el espacio latente del VAE de LTX-Video para atencion conjunta viso-tactil.
- Integracion de pose de mano: acepta un vector de pose de 22 dimensiones junto con la senal tactil.
- Prediccion temporal: soporta horizontes de prediccion de al menos T=1 y T=9 mediante la cabeza temporal TimeSformer.
- Deteccion de contacto activo: produce mapas de contacto con recall y precision medidos por dedo.
- No es un modelo linguistico: no genera texto, no soporta tool calling ni razonamiento multi-paso, y no tiene capacidades multilingues.
- Uso como componente: se carga desde configuraciones de etapa 2 o 3 de DexTacWAM, no como modelo autonomo.

## Casos de uso

- Modelos mundo viso-tactiles para robotica: se usa como rama tactil en configuraciones de etapa 2 o 3 de DexTacWAM, apuntando `tactile_vae.model_path` al checkpoint para que el entrenador construya y congele el modelo. Es adecuado porque su salida ya esta alineada con el espacio latente visual del VAE.
- Manipulacion diestra con retroalimentacion tactil: permite a politicas robotica razonar sobre contacto fisico por dedo (por ejemplo, presion y deslizamiento) junto con la observacion visual, algo critico en tareas como agarre de objetos fragiles o ensamblaje.
- Prediccion de contacto en horizonte corto: con recall de 0,748 en T=1 y 0,725 en T=9, sirve para anticipar regiones de contacto activo y planificar la accion del efector.
- Investigacion en representaciones multimodales: util para estudiar como alinear modalidades no visuales (tacto) con espacios latentes generativos de video preentrenados, reutilizando el VAE de LTX-Video sin reentrenarlo.
- Entrenamiento de expertos de accion: cualquier experto de accion de DexTacWAM carga esta rama tactil como inicializacion, por lo que el checkpoint sirve de base para experimentos con nuevas tareas o morfologias de mano.
- Evaluacion de manos diestras Sharpa Wave: el modelo esta calibrado para la configuracion de dos manos Sharpa Wave (dos manos, cinco dedos, pose de 22 dimensiones), lo que lo hace adecuado para validar sensores tactiles en ese hardware.

## Benchmarks y rendimiento

Metricas de validacion en episodios reservados, en el paso 53.000, a dos horizontes de prediccion:

| Metrica | T=1 | T=9 |
|---|---|---|
| Recall de contacto activo | 0,748 | 0,725 |
| Precision de contacto activo | 0,809 | 0,749 |
| MSE de flujo, regiones activas | 3,04 | 3,88 |
| MSE de flujo, regiones inactivas | 0,038 | 0,051 |

Recall medio entre horizontes: 0,737. El pulgar presenta el mayor recall por dedo (0,846 en T=1); el desglose completo por dedo esta en `best_metrics.json`. No se han publicado comparaciones con otros codificadores tactiles en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El checkpoint pesa 866 MB en `model.pt`, pero requiere cargar ademas el VAE de LTX-Video completo como tronco congelado, lo que eleva el consumo.
- GPU recomendadas: no disponible. El ejemplo de uso del autor emplea `device=torch.device("cuda")` con `dtype=torch.bfloat16`, lo que sugiere GPU con soporte de bfloat16 (Ampere o posterior).
- Cabe en GPU consumer: no confirmado. El adaptador por si solo es pequeno, pero el VAE de LTX-Video condiciona el requisito real de memoria.
- Opciones de despliegue: carga directa con PyTorch mediante `_load_v0c_a_frozen` y `load_latent_models` del repositorio DexTacWAM. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a un modelo no linguistico).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre codificadores tactiles comparables en la documentacion proporcionada. La comparativa con alternativas de la misma categoria (codificadores tactiles para manipulacion diestra) no esta disponible.

## Limitaciones y advertencias

- No es un modelo autonomo: el adaptador no contiene copia del VAE, por lo que cargarlo directamente exige suministrar el tronco LTX-Video por separado.
- Dependencia del pipeline: el uso previsto es como componente de DexTacWAM en etapas 2 o 3; no esta pensado para inferencia aislada fuera de ese sistema.
- Especificidad de hardware: calibrado para dos manos Sharpa Wave con entrada `(2, 5, 192, 256)` y pose de 22 dimensiones; no se documenta generalizacion a otras morfologias.
- Datos de entrenamiento limitados: solo 488 episodios (3,5 horas, 464 de entrenamiento), lo que puede limitar la generalizacion a escenarios no representados.
- Precision de contacto moderada: precision de 0,749 en T=9, con falsos positivos de contacto que pueden afectar a decisiones de agarre en produccion.
- Sin datos sobre sesgos, alucinacion o limitaciones de idioma: no aplica en el sentido linguistico, pero no se documentan sesgos de dominio.
- Licencia: los pesos son Apache 2.0, pero partes del repositorio de codigo DexTacWAM derivadas de Genie-Envisioner estan bajo CC BY-NC-SA 4.0, lo que restringe el uso comercial de esos ficheros fuente concretos (no de estos pesos).
- Reproducibilidad: requiere las dos configuraciones de entrenamiento en orden; la segunda arranca en caliente desde el paso 30.000 de la primera.

## Enlaces

- Hugging Face: https://huggingface.co/JensenYuan/DexTacWAM_multi_finger_tactile_encoder
- Repositorio de codigo: https://github.com/dextacwam/DexTacWAM
- Paper: arXiv:2609.24976 (DexTacWAM: A Visuo-Tactile World-Action Model for Dexterous Manipulation)
- Configuracion de entrenamiento: `configs/stage1_visual_vae_adapter.yaml` en el repositorio de codigo
- Metricas de validacion: `best_metrics.json` en el repositorio de Hugging Face
