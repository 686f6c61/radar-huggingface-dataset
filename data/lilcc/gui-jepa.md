# LilCC/GUI-JEPA

## Resumen

GUI-JEPA es un modelo especializado en la selección de acciones para agentes que operan interfaces gráficas de movil (GUI agents), desarrollado por Bingchao Wang, Yongcheng Jing, Shunyu Liu y colaboradores (publicado en arXiv con el identificador 2610.36877). A diferencia de los agentes GUI basados en grandes modelos de lenguaje y visión (VLM) que generan acciones de forma autoregresiva, GUI-JEPA formula la selección de acción como un problema de puntuación de latentes JEPA condicionados por candidatos: dado un screenshot y un objetivo en lenguaje natural, codifica la pantalla en una rejilla de tokens visuales y evalúa cada acción candidata ejecutable mediante un predictor residual, una cabeza estructural y un matcher de texto.

El sistema completo tiene aproximadamente 0,50B parámetros, incluyendo un codificador de texto CLIP congelado, y según el autor corre entre 2,8 y 4,0 veces más rápido que un Qwen2.5-VL-7B de referencia servido con vLLM en una NVIDIA H20 bajo el mismo protocolo. Esta eficiencia lo posiciona como una alternativa ligera para políticas de acción en entornos móviles donde la latencia y el coste de inferencia son críticos.

El repositorio contiene el checkpoint final de la semilla 3, que sirve tanto para el subconjunto AC-Low como AC-High con una única política. El modelo se distribuye con licencia MIT, está entrenado y evaluado sobre el conjunto AndroidControl y solo declara soporte para inglés. No es un `AutoModel` de Transformers, sino una arquitectura personalizada que requiere los módulos del repositorio de código para su carga.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | JEPA visual (ViT-L/16 congelado) + predictor residual + cabezas estructurales y matcher de texto MiniLM |
| Parametros totales | ~0,50B (incluye codificador de texto CLIP congelado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; entrada visual fija de 224x224) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors y checkpoints PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura se compone de un codificador visual JEPA basado en ViT-L/16 (`timm/vit_large_patch16_224.augreg_in21k_ft_in1k`) preentrenado sobre capturas de pantalla GUI y congelado durante el entrenamiento de la política. El screenshot se redimensiona a 224x224, se normaliza con media y desviación típica de ImageNet y se codifica en una rejilla de 14x14 tokens de parche de 1.024 dimensiones. Un predictor residual condiciona esta rejilla sobre cada acción candidata ejecutable y su región de interés; después, una cabeza estructural y un matcher de texto basado en MiniLM puntúan los candidatos.

El sistema incluye tres módulos de texto afinados: un matcher de política MiniLM-L12, un ranker de spans MiniLM-L6 para rellenar texto tipado a partir del objetivo (`input_text`) y un reranker de clics MiniLM-L12 con compuerta por tipo de acción. También incorpora un vocabulario de aplicaciones (`metadata/app_vocab.json`) usado por la heurística de argumento de `open_app`. El entrenamiento se realiza sobre AndroidControl con evaluación offline de un solo paso y historial de acciones ground-truth; no se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicó RLHF o DPO.

## Capacidades

- Selección de acciones sobre interfaces móviles Android: clics, entrada de texto, apertura de aplicaciones y acciones estructurales.
- Puntuación de acciones candidatas en un único pase por lotes (batched pass), sin generación autoregresiva.
- Condicionamiento por objetivo en lenguaje natural (inglés) para determinar la acción a ejecutar.
- Relleno de campos de texto (`input_text`) mediante un ranker de spans que extrae el contenido del objetivo.
- Reranking de clics con compuerta por tipo de acción para refinar la selección.
- Heurística de argumento de aplicación basada en vocabulario ordenado de apps.
- Evaluación sobre los subconjuntos AC-Low y AC-High de AndroidControl con una única política.
- Soporte multilingüe: no disponible; solo inglés declarado.

## Casos de uso

- Automatización de pruebas de aplicaciones Android: el modelo puede seleccionar acciones sobre capturas de pantalla para recorrer flujos de UI de forma automatizada, aprovechando su bajo coste de inferencia frente a VLM de 7B.
- Agentes de asistencia móvil: interpreta un objetivo en inglés y el estado de la pantalla para decidir el siguiente clic o entrada de texto, adecuado para asistentes que guían al usuario paso a paso.
- Relleno automatizado de formularios: el ranker de spans extrae del objetivo el texto a introducir en campos `input_text`, útil en tareas de registro o búsqueda.
- Selección de aplicaciones por nombre: la heurística de `open_app` con vocabulario de aplicaciones permite lanzar apps a partir de la instrucción del usuario.
- Evaluación comparativa de agentes GUI: sirve como política de referencia ligera en benchmarks tipo AndroidControl para medir precisión por paso y latencia.
- Despliegue en entornos con recursos limitados: al tener ~0,50B parámetros y correr 2,8–4,0x más rápido que un VLM de 7B en H20, es apto para servir políticas de acción con requisitos de latencia estrictos.
- Investigación en representaciones JEPA para control: el checkpoint permite reproducir experimentos de latentes condicionados por candidatos en tareas de interacción visual.

## Benchmarks y rendimiento

| Evaluación | Episodios | Pasos | AC-Low | AC-High |
|---|---:|---:|---:|---:|
| IDD, checkpoint semilla 3 liberado | 716 | 3.858 | 84,06 | 60,99 |
| Test completo, semilla 3 (reportado en el paper) | 1.543 | 8.444 | 78,64 | 53,75 |

La precisión es precisión por paso en porcentaje bajo coincidencia exacta. El autor reporta además una velocidad de inferencia 2,8–4,0x superior a un Qwen2.5-VL-7B de referencia servido con vLLM en una NVIDIA H20 bajo el mismo protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~0,50B parámetros totales, el peso en precisión completa ronda 1–2 GB, más el codificador CLIP y los módulos MiniLM.
- GPU recomendadas: el autor reporta mediciones en NVIDIA H20; no se especifican otras GPU en la información disponible.
- GPU de consumo: no se confirma compatibilidad con GPU de consumo en la información proporcionada.
- Opciones de despliegue: carga mediante los módulos `gui_jepa` del repositorio de código y scripts de evaluación; no es compatible con `AutoModel` de Transformers. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 2,8–4,0x más rápido que Qwen2.5-VL-7B con vLLM en H20; no se publican valores absolutos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión AC-Low / AC-High | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GUI-JEPA | ~0,50B | no disponible | 84,06 / 60,99 (IDD) | MIT | Hugging Face + GitHub |
| Qwen2.5-VL-7B (referencia del paper) | 7B | no disponible en esta ficha | no disponible | no disponible en esta ficha | Hugging Face |
| Otros agentes GUI basados en VLM | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación cuantitativa disponible es la de velocidad frente a Qwen2.5-VL-7B servido con vLLM en H20; no se han publicado en la información disponible resultados de precisión de modelos alternativos bajo el mismo protocolo.

## Limitaciones y advertencias

- Solo soporta inglés; no se declaran capacidades multilingües.
- Entrenado y evaluado exclusivamente sobre AndroidControl; la generalización a otras plataformas o apps no está validada en la información disponible.
- La evaluación es offline con historial de acciones ground-truth y predicción de un solo paso; el rendimiento en ejecución online multi-paso puede diferir.
- No es un `AutoModel` de Transformers: requiere los módulos y scripts del repositorio de código, lo que complica la integración en pipelines estándar.
- La primera ejecución necesita conexión a internet o caché local de Hugging Face para cargar `openai/clip-vit-base-patch32` y los módulos MiniLM upstream.
- No se publican datos sobre sesgos, tasa de alucinación ni robustez ante pantallas fuera de distribución.
- Licencia MIT: permite uso comercial, pero conviene revisar las licencias de los modelos base (ViT-L/16 de timm, MiniLM y CLIP) por posibles obligaciones adicionales.
- No se especifican requisitos mínimos de hardware para despliegue en producción más allá de las mediciones en H20.

## Enlaces

- Hugging Face: https://huggingface.co/LilCC/GUI-JEPA
- Paper (arXiv): https://arxiv.org/abs/2610.36877
- Repositorio de código: https://github.com/bcwang-sjtu/GUI-JEPA
- Commit de código de referencia: https://github.com/bcwang-sjtu/GUI-JEPA/tree/c03c565065a8b31f9d4ce1be6c29104c8869799f
- Codificador de texto CLIP: https://huggingface.co/openai/clip-vit-base-patch32
