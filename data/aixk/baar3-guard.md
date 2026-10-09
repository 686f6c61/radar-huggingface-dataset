# aixk/BAAR3-guard

## Resumen

BAAR3-guard Ultra (identificador `aixk/BAAR3-guard`) es un modelo de clasificación tabular orientado a ciberseguridad, publicado por el autor `aixk` bajo licencia Apache 2.0. No es un modelo de lenguaje generativo, sino un clasificador compacto que se presenta como un motor de defensa en línea ("in-line AI threat engine") para detección de intrusiones, con etiquetado de cero confianza ("zero-trust") y despliegue en el borde. Según su model card, está entrenado sobre el conjunto de datos CIC-IDS2017 con una representación de doble serie temporal: una ventana macro de 60 pasos y una ventana micro de 24 pasos.

El modelo es de tamaño muy reducido: 644.381 parámetros totales según los pesos reales en `safetensors`. Se distribuye en varios formatos pensados para inferencia rápida y ligera: pesos en SafeTensors (PyTorch), un grafo ONNX para runtimes de borde y WebAssembly, y un binario propio con extensión `.baar3` en FP16 que el autor describe como kernel "zero-copy direct-mmap". El repositorio incluye además un `config.json` con metadatos de escalador robusto ("robust scaler") y umbrales de cero confianza.

Su relevancia radica en el nicho: un clasificador extremadamente pequeño (del orden de megabytes) que puede ejecutarse en línea dentro de infraestructura de red sin GPU, en lugar de depender de modelos grandes. Los datos públicos son escasos (46 descargas, 0 "likes" en el momento de la consulta) y no se han publicado resultados de benchmarks en la información disponible, por lo que cualquier evaluación de rendimiento real queda pendiente de verificación independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador tabular sobre doble serie temporal; la model card no especifica la topologia de red) |
| Parametros totales | 644.381 (dato real de los pesos en safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular); ventanas de entrada de 60 pasos macro + 24 pasos micro |
| Tipos de cuantizacion | FP16 (binario `.baar3`); pesos en precision de PyTorch sin cuantizar indicada; ONNX para runtime de borde |
| Idiomas soportados | en, ko (segun metadatos del repositorio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, ONNX, `.baar3` (binario FP16 con direct-mmap) |

## Arquitectura y entrenamiento

La model card no describe la topologia interna del modelo mas alla de indicar que se trata de un clasificador tabular entrenado con una representacion de doble serie temporal: una ventana "Macro 60" y una ventana "Micro 24". Esto sugiere una extraccion de caracteristicas a dos escalas temporales sobre flujos de red, presumiblemente a partir de las caracteristicas del conjunto CIC-IDS2017 (que combina trafico benigno y multiples familias de ataques de red). La presencia de pesos en SafeTensors de PyTorch y de un grafo ONNX apunta a una implementacion neuronal, pero el tipo concreto (MLP, red recurrente, etc.) no se especifica.

El entrenamiento se realizo sobre CIC-IDS2017 segun la propia model card. No se indica el numero de tokens o muestras, la composicion exacta del dataset, ni si hubo fases de ajuste tipo RLHF o DPO (no aplicables habitualmente a clasificacion tabular). Los elementos de innovacion declarados se centran en el despliegue mas que en el entrenamiento: un kernel binario propio en FP16 con acceso directo por mmap ("zero-copy") y un artefacto ONNX orientado a WebAssembly y runtimes de borde. El `config.json` incluye metadatos de escalador robusto y umbrales de decision de cero confianza, lo que indica que el preprocesado de caracteristicas forma parte del contrato de uso del modelo.

## Capacidades

- Clasificacion tabular de eventos de red: etiquetado de trafico benigno o malicioso a partir de caracteristicas derivadas de ventanas temporales (60 macro + 24 micro).
- Deteccion de intrusiones en linea: pensado para inspeccion en tiempo real dentro de un flujo de red o firewall.
- Enfoque de cero confianza ("zero-trust"): los umbrales de decision vienen definidos en el `config.json`, lo que sugiere un esquema de verificacion estricta.
- Despliegue ligero: al ser un modelo de ~644 K parametros, puede ejecutarse en CPU, en el borde e incluso en WebAssembly.
- Salidas de clasificacion estructurada (no generacion de texto).
- Idiomas de documentacion en ingles y coreano; el modelo en si no procesa lenguaje natural de forma nativa.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision ni audio.

## Casos de uso

- Deteccion de intrusiones en linea: el modelo puede clasificar flujos de red en tiempo real dentro de un firewall o IDS, aprovechando sus ventanas macro/micro para capturar tanto tendencias largas como picos cortos de trafico anomalo.
- Filtrado en el borde (edge): gracias a su tamano (unos pocos megabytes), puede desplegarse en pasarelas, routers o dispositivos IoT con CPU limitada, sin necesidad de GPU.
- Inspeccion en WebAssembly: el grafo ONNX puede ejecutarse en entornos WASM, lo que permite integrar la clasificacion en proxies o funciones serverless sin salir del sandbox.
- Segmentacion de red de cero confianza: con umbrales definidos en el `config.json`, encaja en arquitecturas zero-trust que exigen validar cada flujo antes de conceder acceso.
- Triaje previo a analistas SOC: la clasificacion automatica de eventos permite reducir el volumen de alertas que llegan a un analista humano, descartando trafico benigno.
- Monitorizacion de trafico en entornos de investigacion: como modelo reproducible sobre CIC-IDS2017, sirve como linea base para comparar pipelines de deteccion en laboratorio.
- Enriquecimiento de registros (logs): puede etiquetar lotes de eventos historicos para analitica posterior, al ser un clasificador tabular desacoplado del flujo en vivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas como precision, recall, F1, AUC ni comparaciones con modelos de referencia.

## Requisitos de hardware

- VRAM estimada: no requiere GPU. Con 644.381 parametros, los pesos en FP32 ocupan aproximadamente 2,5 MB, y en FP16 alrededor de 1,3 MB; caben holgadamente en memoria de cualquier sistema.
- GPU recomendadas: ninguna necesaria. Puede ejecutarse en CPU de un solo nucleo.
- Viabilidad en GPU de consumo: si, en cualquier GPU de consumo, aunque es innecesaria por el tamano del modelo.
- Opciones de despliegue: ONNX Runtime, runtimes de WebAssembly y binario propio `.baar3` con direct-mmap; no se documenta soporte explicito para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a modelos de lenguaje, no a clasificacion tabular).
- Latencia y throughput: no disponibles; el autor describe el binario FP16 como de "altisima velocidad", pero no aporta cifras medidas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (clasificacion tabular para deteccion de intrusiones) ni datos de rendimiento que permitan establecer una comparacion objetiva.

## Limitaciones y advertencias

- Alcance limitado al dominio de entrenamiento: el modelo se ha entrenado sobre CIC-IDS2017; su generalizacion a otras redes, protocolos o familias de ataque no esta documentada.
- Sesgo de dataset: CIC-IDS2017 tiene una composicion concreta de trafico y ataques, lo que puede introducir sesgos hacia los patrones presentes en dicho corpus y penalizar clases poco representadas.
- Sin benchmarks publicos: no hay metricas verificables de precision, recall ni falsos positivos, por lo que su rendimiento real en produccion es desconocido.
- Riesgo de falsos positivos y negativos: en un IDS en linea, un falso negativo implica un ataque no detectado y un falso positivo puede bloquear trafico legitimo; no hay datos para acotar este riesgo.
- Dependencia del preprocesado: el `config.json` define un escalador robusto y umbrales; usarlo con una normalizacion distinta a la esperada degrada la validez de las salidas.
- Licencia Apache 2.0: permisiva y apta para uso comercial, pero conviene revisar las condiciones del conjunto CIC-IDS2017 subyacente si se redistribuye o se usa con fines derivados.
- Madurez y soporte: 46 descargas y 0 "likes" en el momento de la consulta; sin mantenimiento ni comunidad documentada. La fecha de creacion del repositorio (2026-10-09) es posterior a la fecha habitual de consulta, lo que conviene verificar.
- No es un modelo generativo: no puede usarse para generacion de texto, resumen ni dialogos; cualquier expectativa de ese tipo es inaplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aixk/BAAR3-guard

No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la informacion proporcionada.
