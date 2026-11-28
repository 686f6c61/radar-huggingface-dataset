# DeepLearnPhysics/panda-v2-instance.wand-sk-like

## Resumen

`panda-v2-instance.wand-sk-like` es un modelo de segmentacion de instancias para fisica de particulas desarrollado por DeepLearnPhysics. Se construye sobre el detector Panda V2 (`panda-detector-v2m1`), cuyo encoder es `panda-v2.wand-sk-like`, preentrenado sobre datos del experimento WAND con un detector tipo SK-like (Super-Kamiokande). El modelo adapta dicho encoder mediante LoRA de rango 16 y afina conjuntamente encoder y cabeza sobre todos los eventos etiquetados de WAND SK-like, publicando el mejor checkpoint de validacion de la ejecucion `panda-v2-wand-nall-nomix-nersc`, que es el que se evalua en el articulo asociado.

El modelo opera sobre nubes de puntos (point clouds) representativas de eventos de deteccion de particulas, no sobre texto. Su proposito es la segmentacion de instancias: identificar y separar las trayectorias o depositos de energia individuales dentro de un evento. Con 60.122.830 parametros y un peso de repositorio de 0,2 GB, es un modelo compacto orientado a un dominio cientifico muy especifico.

Es relevante para investigadores que trabajen en reconstruccion de eventos en detectores de tipo Cherenkov o calorimetricos, ya que ofrece un pipeline reproducible (libreria `pimm`) para cargar pesos preentrenados y aplicar transformaciones de evaluacion documentadas. No es un modelo de lenguaje ni tiene capacidades generativas de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Detector Panda V2 (`panda-detector-v2m1`) con encoder `panda-v2.wand-sk-like` y cabeza de segmentacion de instancias; adaptacion LoRA de rango 16 |
| Parametros totales | 60.122.830 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo sobre nubes de puntos, no secuencial de texto) |
| Tipos de cuantizacion | No disponible; pesos en safetensors (precision no especificada en la model card) |
| Idiomas soportados | No aplica (modelo de vision/fisica, sin capacidades linguisticas) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Libreria | pimm |
| Dominio | Fisica de particulas, nubes de puntos |
| Tamano del repositorio | 0,2 GB |
| Backend de atencion | FlashAttention por defecto; `attention_backend="torch"` en GPUs sin FlashAttention |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Panda V2, un detector disenado para segmentacion de instancias sobre nubes de puntos en el contexto de imagen de particulas. La base es el encoder `panda-v2.wand-sk-like`, preentrenado sobre datos de WAND SK-like. Sobre este encoder se aplica una adaptacion LoRA de rango 16 y se afina el conjunto encoder-cabeza sobre todos los eventos etiquetados de WAND SK-like. El checkpoint publicado corresponde al mejor punto de validacion de la ejecucion `panda-v2-wand-nall-nomix-nersc`.

La model card no detalla el numero de tokens o eventos de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF/DPO (no aplicables en este dominio). Tampoco se especifica la innovacion arquitectonica concreta mas alla de la referencia al detector Panda V2. La nomenclatura `nomix` sugiere que el entrenamiento no empleo mezcla de datasets, pero este extremo no se confirma en la informacion disponible.

## Capacidades

- Segmentacion de instancias sobre nubes de puntos de eventos de fisica de particulas.
- Deteccion y separacion de multiples instancias (trayectorias o depositos) dentro de un mismo evento.
- Carga directa mediante `pimm.from_pretrained` con dispositivo configurable (por ejemplo, `cuda`).
- Compatibilidad con FlashAttention y fallback a backend `torch` en GPUs sin soporte.
- Adaptacion LoRA integrada en los pesos publicados (no requiere cargar adaptadores por separado).
- No soporta generacion de texto, tool calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni funciones fuera del dominio de nubes de puntos.

## Casos de uso

- Reconstruccion de eventos en detectores SK-like: el modelo segmenta las instancias de un evento de WAND SK-like, permitiendo separar contribuciones individuales de particulas en la reconstruccion offline.
- Analisis de datos de WAND: investigadores que procesen el conjunto WAND SK-like pueden aplicar el modelo directamente como referencia de segmentacion sobre los eventos etiquetados del articulo.
- Reproduccion de resultados cientificos: al ser el checkpoint evaluado en el test split del paper, sirve para replicar las cifras publicadas y comparar con nuevas propuestas.
- Baseline para fine-tuning: el encoder preentrenado con LoRA permite adaptar el detector a otros conjuntos de eventos con un coste de ajuste reducido gracias al rango 16.
- Prototipado en pipelines de imagen de particulas: la integracion con `pimm` y las transformaciones de `configs/panda/v2/finetune/_base_/datasets/wc.py` facilitan incorporar el modelo a flujos de evaluacion existentes.
- Investigacion en segmentacion de nubes de puntos: el modelo puede servir como referencia arquitectonica en experimentos de segmentacion de instancias fuera del dominio de fisica, aunque requeriria reentrenamiento.
- Despliegue en GPUs modestas: con 60 millones de parametros y 0,2 GB de pesos, es viable en entornos con recursos limitados para inferencia por lotes sobre eventos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que estos son los pesos evaluados en el test split del paper, pero no incluye las cifras.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 60,1 millones de parametros y pesos de 0,2 GB, la inferencia requiere tipicamente menos de 1 GB en precision de 16 bits, aunque la precision real de los pesos no se especifica.
- GPU recomendadas: cualquier GPU con soporte CUDA; se menciona FlashAttention como backend por defecto, disponible en arquitecturas Ampere y posteriores (A100, H100, RTX 30xx/40xx).
- GPUs consumer: cabe con holgura en cualquier GPU consumer moderna (RTX 3060 en adelante); en GPUs sin FlashAttention debe usarse `attention_backend="torch"`.
- Opciones de despliegue: libreria `pimm` (carga via `pimm.from_pretrained`); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de segmentacion de instancias en fisica de particulas ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Dominio muy restringido: solo aplicable a nubes de puntos de eventos de fisica de particulas, especificamente WAND SK-like; no es un modelo de proposito general.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; debe contactarse con el autor antes de cualquier uso productivo.
- Riesgo de sobreajuste al conjunto WAND SK-like: al haberse afinado sobre todos los eventos etiquetados de ese dataset, la generalizacion a otros detectores o distribuciones de eventos no esta garantizada.
- Sin datos de benchmarks publicados en la informacion disponible, por lo que no es posible evaluar su calidad relativa frente a alternativas.
- Requiere transformaciones de entrada especificas (`configs/panda/v2/finetune/_base_/datasets/wc.py`); un preprocesado incorrecto puede degradar los resultados.
- Dependencia de FlashAttention para el backend por defecto; en GPUs sin soporte debe configurarse explicitamente el backend `torch`.
- Sin informacion sobre sesgos, calibracion o incertidumbre de las predicciones.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion limitado.

## Enlaces

- Hugging Face: https://huggingface.co/DeepLearnPhysics/panda-v2-instance.wand-sk-like
- Encoder base: https://huggingface.co/DeepLearnPhysics/panda-v2.wand-sk-like
- Repositorio pimm: https://github.com/DeepLearnPhysics/particle-imaging-models
- Configuracion de evaluacion: `configs/panda/v2/finetune/_base_/datasets/wc.py` (dentro del repositorio pimm)
