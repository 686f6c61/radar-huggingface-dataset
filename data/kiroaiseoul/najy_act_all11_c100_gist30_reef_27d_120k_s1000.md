# kiroaiseoul/NAJY_act_all11_c100_gist30_reef_27D_120k_s1000

## Resumen

NAJY_act_all11_c100_gist30_reef_27D_120k_s1000 es un checkpoint de robótica, no un modelo de lenguaje: se trata de una política de imitación visuomotora entrenada con la implementación ACT (Action Chunking Transformer) de la librería LeRobot. Lo publica el usuario kiroaiseoul en HuggingFace y está pensado para el entorno Trossen Mobile AI, según indican las etiquetas del repositorio (`lerobot`, `act`, `robotics`, `trossen-mobile-ai`). El modelo consume el estado del robot (27 dimensiones), un estado de entorno adicional (11 dimensiones) y tres cámaras RGB de 480x640 (vista alta y dos muñecas), y emite un vector de acción de 16 dimensiones. Cuenta con 51.707.024 parámetros (unos 51,7 M) y un repositorio de 0,2 GB en formato safetensors.

El checkpoint corresponde al paso 120.000 del run `exp_all11_c100_gist30_reef_s1000_120k` y, según la propia model card, se sube con fines de análisis y puntuación (체크포인트 = checkpoint; "subida para análisis y scoring"), no como candidato confirmado para despliegue en robot real. Incorpora un flag de manifiesto `env_stage_token: true`, lo que sugiere condicionamiento por etapa o fase de la tarea, algo coherente con un pipeline de 11 etapas (`all11`).

Su relevancia es acotada pero concreta: sirve como referencia reproducible para quien investigue imitación con múltiples cámaras y base móvil en LeRobot, y como objeto de verificación de integridad (el autor publica el sha256 del fichero de pesos). No hay datos de benchmarks, idiomas ni contexto en el sentido de los LLM, y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking Transformer) sobre LeRobot; el detalle de capas, dimensión de embedding y chunk size no está disponible en la información proporcionada |
| Parametros totales | 51.707.024 (51,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. El equivalente sería el horizonte de acción (action chunk) y no está publicado |
| Tipos de cuantizacion | no disponible; se publican pesos en safetensors sin indicación de cuantización |
| Idiomas soportados | no aplica / no disponible (política robótica sin interfaz de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`, sha256 `15d53cb4ae359dff898cc4c6f35e87dcc1eea6af871c3a4fd5067524c60fbb06`) |
| Tipo de modelo | política de imitación visuomotora para manipulación robótica (pipeline `robotics`) |
| Dimension de `observation.state` | 27 |
| Dimension de `observation.environment_state` | 11 |
| Dimension de `action` | 16 |
| Entradas visuales | 3 cámaras RGB 480x640: `cam_high`, `cam_left_wrist`, `cam_right_wrist` |
| Libreria | lerobot |
| Checkpoint | paso 120.000 del run `exp_all11_c100_gist30_reef_s1000_120k` |
| Flags de manifiesto | `env_stage_token: true` |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-10-19 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

ACT (Action Chunking with Transformers) es una política de imitación que combina un extractor visual convolucional por cámara con un transformer encoder-decoder que predice un bloque de acciones futuras en lugar de una sola acción, y que incorpora una cabeza de autoencoder variacional condicional (CVAE) para modelar la multimodalidad de las demostraciones humanas. La información disponible confirma el uso de la implementación `act` de LeRobot y la firma exacta de entradas y salidas (estado de 27 dimensiones, estado de entorno de 11 dimensiones, tres vistas de 480x640 y acción de 16 dimensiones), pero no detalla hiperparámetros como el tamaño del chunk, el número de capas, las dimensiones ocultas ni la estrategia de aumento de datos.

En cuanto al entrenamiento, la model card indica que se ejecutó en una máquina denominada DGX_1 y que el run arrancó (o reanudó) el 2026-10-18 a las 22:28:20 (+09:00) sobre el commit git `1934ea6`, con el manifiesto `configs/datasets/all11_tr_hot_gist30_reef.json` y sha256 de manifiesto `966dd172138582e9`. El nombre del run sugiere 11 etapas (`all11`), un factor `c100`, una variante `gist30` del dataset y un `s1000` probablemente asociado al número de pasos o a la semilla. No se especifican el número de tokens, el número de episodios de demostración, la composición del dataset, ni si hubo etapas de RLHF o DPO (no aplicables habitualmente en este tipo de políticas). Sí se declara el flag `env_stage_token`, que apunta a un condicionamiento explícito por etapa de la tarea dentro de la arquitectura o del preprocesado.

## Capacidades

- Predicción de acciones de 16 dimensiones para control de robot manipulador con base móvil, a partir de observaciones visuomotoras.
- Fusión de tres cámaras simultáneas (vista cenital y dos muñecas), lo que habilita agarre y manipulación fina con realimentación visual de ambas manos.
- Condicionamiento por estado del robot (27 dimensiones) y por estado de entorno (11 dimensiones), lo que permite reaccionar a la configuración del entorno además de a la propiocepción.
- Condicionamiento por etapa de tarea (`env_stage_token: true`), orientado a secuencias de 11 etapas (`all11`).
- Aprendizaje por imitación: reproduce comportamientos demostrados, sin necesidad de recompensa explícita.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso simbólico ni generación de texto: no es un modelo de lenguaje.
- No dispone de capacidades multilingües, visión general (VQA, OCR) ni audio; las imágenes se usan exclusivamente como entrada de política.
- No se documenta modo "thinking", decodificación especulativa ni atención lineal.

## Casos de uso

- Manipulación por etapas en robot con base móvil: el modelo consume el flag de etapa y el estado de entorno para ejecutar una secuencia de 11 fases; es adecuado porque la dimensión `env_stage_token` está explícitamente entrenada para ese particionado.
- Investigación en imitación visuomotora multi-cámara: sirve como punto de partida reproducible para comparar variantes de ACT con una, dos o tres vistas, al estar publicados el manifiesto y el hash de los pesos.
- Verificación de integridad en pipelines de CI: el autor publica el sha256 de `model.safetensors` y espera que se compruebe con `sha256sum`, de modo que el checkpoint puede integrarse en un test automatizado que valide la descarga antes de evaluar.
- Evaluación y scoring de checkpoints: la model card indica que la subida es para análisis y puntuación, con una herramienta que lee flags desde `multi_manifest.json` en la misma carpeta y acepta `--checkpoint <carpeta>`; encaja en un flujo de comparación de candidatos antes de decidir un despliegue.
- Base para ajuste fino con nuevas demostraciones: al ser un ACT de 51,7 M de parámetros con licencia Apache 2.0, puede reentrenarse o afinarse en un único servidor con GPU consumer para nuevas tareas de manipulación.
- Recolección de datos asistida y despliegue en simulación: dado su reducido tamaño, puede ejecutarse en paralelo a la teleoperación para etiquetar episodios o para predecir acciones en el simulador `trossen-ai-simulation` antes de pasar al robot físico.
- Prototipado de agarre con realimentación de muñeca: las dos vistas de muñeca permiten entrenar y evaluar políticas de pinza en tareas de pick-and-place donde la vista cenital queda ocluida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente aporta metadatos de ejecución (run, paso 120.000, hashes y manifiesto) y no incluye tasas de éxito, errores de trayectoria ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB solo para pesos en fp32 (51,7 M de parámetros) y 0,1 GB en fp16; el consumo real vendrá dominado por las activaciones de las tres cámaras a 480x640. Estimación orientativa: 1-2 GB en fp32, sin datos medidos por el autor.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente por tamaño de modelo; para entrenamiento o ajuste fino conviene una GPU de gama media-alta (RTX 3090/4090, A100, H100) por el coste de procesar tres flujos de imagen.
- Cabe en GPU consumer: sí, previsiblemente en cualquier tarjeta moderna con 4 GB o más (GTX 1650 en adelante); también puede ejecutarse en CPU, con latencia mayor no cuantificada.
- Opciones de despliegue: LeRobot (carga como `pretrained_model` y uso directo con las herramientas de evaluación del autor, por ejemplo `stage_cond_diag.py`); PyTorch nativo. No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores de modelos de lenguaje.
- Latencia y throughput: no disponibles. El paper original de ACT reporta ejecución en tiempo real en hardware consumer para ALOHA, pero no se ha verificado para este checkpoint ni con esta configuración de tres cámaras.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NAJY_act_all11_c100_gist30_reef_27D_120k_s1000 (este) | ACT / imitación | 51,7 M | 3 cámaras 480x640 + estado 27D + entorno 11D; chunk no disponible | Apache 2.0 | HuggingFace, 0 descargas |
| kiroaiseoul/NAJY_act_all11_c100_gist30_27D_120k_s1000 | ACT / imitación (misma familia, sin variante `reef`) | no disponible | no disponible | no disponible | HuggingFace |
| Checkpoints ACT oficiales de LeRobot (p. ej. familia `lerobot/act_*`) | ACT / imitación | no disponible | configuraciones ALOHA/Sim de 1 o varias cámaras | no disponible | HuggingFace |
| Políticas alternativas en LeRobot (Diffusion Policy y similares) | imitación (difusión) | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de datos verificables de parámetros, contexto ni rendimiento de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- No es un modelo de lenguaje: cualquier uso esperado de generación de texto, razonamiento, código o tool calling no está soportado.
- La model card indica explícitamente que es una subida para análisis y puntuación, y que no equivale a la confirmación de un candidato para despliegue en robot real.
- Ausencia total de benchmarks: no hay evidencia publicada de tasa de éxito, robustez ni generalización fuera de las 11 etapas y del dataset `all11_tr_hot_gist30_reef`.
- Fuerte acoplamiento al hardware y a la configuración de sensores: 27 dimensiones de estado, 11 de entorno, acción de 16 dimensiones y tres cámaras concretas. Reutilizarlo en otro robot exige rediseñar las dimensiones de entrada y salida.
- Riesgo de sobreajuste al dataset de demostración y de fallo ante distribuciones visuales no vistas (iluminación, oclusiones, fondos distintos); no hay métricas que lo cuantifiquen.
- Sesgos no documentados: al ser imitación de demostraciones humanas, puede heredar sesgos de la persona que teleoperó y de la distribución de posiciones iniciales del dataset.
- Idiomas no aplicables; la documentación está en coreano, lo que puede dificultar su mantenimiento a equipos no coreanohablantes.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad de validación en producción recae en el integrador.
- Fecha de creación declarada en 2026-10-19 y 0 descargas / 0 likes: repositorio sin validación comunitaria, con una única fuente de autor.
- Dependencia de la coherencia del manifiesto: la herramienta de scoring lee flags de `multi_manifest.json`; un manifiesto ausente o alterado invalida la evaluación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_reef_27D_120k_s1000
- Modelo hermano de la misma familia: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_27D_120k_s1000
- Árbol de ficheros del modelo hermano: https://huggingface.co/kiroaiseoul/NAJY_act_all11_c100_gist30_27D_120k_s1000/tree/main
- LeRobot (librería y políticas ACT): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot
- Paper de ACT (Action Chunking with Transformers): https://arxiv.org/abs/2304.13705
- Referencia citada por el autor (`trossen-ai-simulation`, `docs/mobile_base_investigation.md` §94): URL no disponible en la información proporcionada
- Resto de resultados de búsqueda recibidos (nyaa.net, kbjradar.com, perplexity.ai): no relevantes para este modelo
