# harshatheg/Qwen-2.5-1B-RLCD

## Resumen

Qwen-2.5-1B-RLCD es un repositorio de inferencia publicado por el usuario harshatheg sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct, orientado a generación estructurada (JSON), clasificación categórica y enrutado de decisiones sobre Apple Silicon mediante la librería MLX. No se trata de un modelo nuevo entrenado desde cero, sino de una adaptación con un motor de decodificación restringida en paralelo (Parallel Constrained Decoding, RLCD) que evalúa simultáneamente todos los campos de un esquema JSON en lugar de generar tokens de forma secuencial.

El problema que aborda es la latencia y la fragilidad sintáctica de la generación estructurada autorregresiva: cuando un esquema tiene muchos campos, cada token exige un paso forward independiente y el modelo puede omitir claves o degradar la sintaxis. La propuesta del autor prefija una sola vez el contexto y el esquema en la caché KV de MLX, la difunde a todos los campos, y para cada campo restringe la distribución softmax al subvocabulario de opciones válidas (booleanos o enums de hasta 255 valores), devolviendo además probabilidades calibradas por campo.

Según los datos publicados por el autor, sobre un Apple Silicon M4 Max y con `mlx-community/Qwen2.5-1.5B-Instruct-4bit`, el motor consigue reducciones de latencia de entre 5,6x y 7,0x frente a la decodificación autorregresiva estándar, con una validez de esquema del 100 % y puntuaciones de confianza por campo. El repositorio acumula 45 likes y 0 descargas, está etiquetado únicamente para inglés y se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivada del modelo base Qwen/Qwen2.5-1.5B-Instruct; el repositorio añade un motor de decodificación restringida en paralelo (RLCD) sobre MLX. La model card no describe la arquitectura interna con detalle |
| Parametros totales | Aproximadamente 1 500 millones (heredados del modelo base). El nombre del repositorio indica «1B», lo que no coincide con el tamaño del modelo base declarado |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | 4 bits, según los benchmarks del autor con mlx-community/Qwen2.5-1.5B-Instruct-4bit. No se detallan otras cuantizaciones publicadas en el repositorio |
| Idiomas soportados | Inglés (en), según la model card y las etiquetas del repositorio |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (library_name: mlx). No se confirman otros formatos como GGUF o safetensors estándar |

## Arquitectura y entrenamiento

El repositorio no documenta un proceso de entrenamiento propio: parte de Qwen/Qwen2.5-1.5B-Instruct, un modelo instruido ya existente, y su aportación principal es el motor de decodificación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO para esta adaptación concreta.

La innovación técnica descrita es Parallel Constrained Decoding. El flujo tiene seis pasos: (1) un único prefijo que introduce el documento de contexto y las descripciones semánticas del esquema en una caché KV de MLX; (2) difusión (broadcasting) de esa caché a los M campos del esquema; (3) recorte de logits al subvocabulario de opciones válidas de cada campo, enmascarando el resto; (4) cálculo de probabilidades softmax normalizadas sobre el candidato recortado, con temperatura T; (5) desambiguación mediante árbol de tokens cuando varias opciones comparten prefijos multi-token, reutilizando estados de caché sin reasignación de memoria; y (6) ensamblado programático del JSON a partir de los valores verificados. Los tipos de campo soportados explícitamente son `enum` (hasta 255 opciones) y `boolean`, con una descripción textual que guía el razonamiento del modelo.

## Capacidades

- Generación de texto y clasificación categórica: el caso de uso central es la extracción de información estructurada y el enrutado de decisiones sobre conjuntos acotados de etiquetas.
- Salida JSON con validez sintáctica garantizada: el ensamblado programático del objeto JSON a partir de valores verificados evita errores de parseo y claves alucinadas.
- Confianza calibrada por campo: se calculan probabilidades softmax normalizadas sobre el subconjunto de candidatos de cada campo, lo que permite umbralizar decisiones.
- Esquemas multi-campo: se documenta un caso con 28 campos y otro con un único campo de alta cardinalidad (255 opciones).
- Soporte de tipos `enum` y `boolean` con descripciones semánticas por campo.
- Multilingüe: no disponible; el modelo está etiquetado solo para inglés.
- Tool calling / function calling: no documentado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas; el motor está orientado a evaluación paralela de campos, no a bucles de razonamiento secuencial.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Enrutado de fraude en servicios financieros: el esquema de ejemplo clasifica cuatro campos (por ejemplo, nivel de riesgo y acción recomendada) en 75 ms sobre M4 Max, lo que permite integrarlo en el camino caliente de una pasarela de pagos donde el presupuesto de latencia es de milisegundos.
- Auditoría de seguridad de código: con cuatro campos y 68 ms por inferencia, se puede aplicar a cada fichero de un pipeline de CI/CD para etiquetar hallazgos sin introducir latencia perceptible en la revisión.
- Clasificación arancelaria de alta cardinalidad: el motor soporta un único campo con hasta 255 opciones, como códigos del Sistema Armonizado de 6 dígitos, resuelto en 89 ms, apto para sistemas aduaneros con volumen alto de partidas.
- Triage de soporte empresarial: el caso documentado con 28 campos se resuelve en 270 ms frente a 1 900 ms del enfoque autorregresivo, lo que hace viable clasificar tickets completos (prioridad, departamento, escalado, etc.) en tiempo real.
- Extracción de datos de documentos: al prefijar el contexto una sola vez y compartir la caché KV entre campos, resulta adecuado para extraer múltiples atributos de contratos, facturas o informes con un coste de prefill amortizado.
- Clasificación con umbral de confianza: las probabilidades normalizadas por campo permiten derivar a revisión humana los casos con confianza baja, útil en procesos regulados donde se exige trazabilidad de la decisión.
- Enrutado de decisiones en agentes locales: sobre un Mac con Apple Silicon se puede ejecutar como componente de clasificación dentro de una aplicación de escritorio sin depender de servicios en la nube.

## Benchmarks y rendimiento

Datos publicados por el autor, evaluados con `mlx-community/Qwen2.5-1.5B-Instruct-4bit` en macOS Sequoia sobre un Apple Silicon M4 Max:

| Escenario | Campos | Baseline autorregresivo | Parallel Constrained | Aceleración de latencia | Validez sintáctica |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Enrutado de fraude fintech | 4 campos | 420 ms (120 tok/s) | 75 ms | 5,6x | 100 % garantizada |
| Auditoría de seguridad de código | 4 campos | 380 ms (125 tok/s) | 68 ms | 5,6x | 100 % garantizada |
| Tarifas de alta cardinalidad | 1 campo (255 opciones) | 500 ms (118 tok/s) | 89 ms | 5,6x | 100 % garantizada |
| Triage de soporte empresarial | 28 campos | 1 900 ms (130 tok/s) | 270 ms | 7,0x | 100 % garantizada |

No se han publicado resultados de benchmarks de calidad de tarea (MMLU, HumanEval, GSM8K u otros) en la información disponible; las métricas anteriores miden latencia y validez de esquema, no precisión semántica.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon (series M1, M2, M3 o M4). La información disponible no contempla soporte CUDA ni ROCm.
- Sistema operativo: macOS 14.0 o posterior.
- Entorno: Python 3.10 o superior, con un entorno virtual e instalación de dependencias mediante `pip install -r requirements.txt`.
- Memoria: los benchmarks emplean una cuantización de 4 bits de un modelo de 1 500 millones de parámetros, lo que sitúa los pesos en torno a 1 GB; a ello hay que sumar la caché KV, que se comparte entre todos los campos del esquema (estimación a partir de los datos publicados, no una cifra confirmada por el autor).
- GPU recomendadas: no se indican modelos de GPU de datacenter; el motor está diseñado específicamente para GPUs integradas de Apple Silicon. No hay datos para A100, H100 o RTX 4090.
- Cabe en hardware de consumo: sí, en cualquier Mac con chip de la serie M y memoria unificada suficiente; no está pensado para GPUs de consumo NVIDIA.
- Opciones de despliegue: librería MLX y el motor Parallel Constrained Decoding incluido en el repositorio; se ofrece una demo en Hugging Face Spaces (drinkmoonshine/parallel-constrained-decoding). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: entre 68 ms y 270 ms por inferencia según el escenario, con aceleraciones de 5,6x a 7,0x sobre el baseline autorregresivo medido en el mismo hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-2.5-1B-RLCD (este repositorio) | ~1 500 millones | No disponible | 68-270 ms por inferencia estructurada en M4 Max; 5,6x-7,0x sobre decodificación autorregresiva | Apache 2.0 | Hugging Face (0 descargas, 45 likes); requiere MLX y Apple Silicon |
| Qwen/Qwen2.5-1.5B-Instruct | ~1 500 millones | No disponible en la información proporcionada | Baseline autorregresivo medido en el mismo hardware: 380-1 900 ms por esquema | Apache 2.0 | Hugging Face, ampliamente desplegado en múltiples runtimes |
| mlx-community/Qwen2.5-1.5B-Instruct-4bit | ~1 500 millones | No disponible | Usado como motor de los benchmarks del autor; requiere una capa externa de decodificación restringida para generar JSON válido | Apache 2.0 | Hugging Face, formato MLX de 4 bits |

No se dispone de comparativas publicadas frente a motores de decodificación restringida alternativos (Outlines, XGrammar, JSON mode nativo de otros runtimes) en la información proporcionada.

## Limitaciones y advertencias

- Idioma: el modelo está etiquetado exclusivamente para inglés, lo que limita su uso en castellano u otros idiomas sin evaluación adicional.
- Alcance restringido de la decodificación: solo se documentan campos de tipo `enum` y `boolean`; no hay soporte declarado para texto libre, valores numéricos continuos o estructuras anidadas arbitrarias.
- Riesgo de clasificación incorrecta: la validez sintáctica del 100 % no implica corrección semántica; un valor de enum puede ser sintácticamente válido y estar equivocado. Las probabilidades por campo permiten mitigarlo con umbrales, pero no se han publicado métricas de precisión.
- Escala limitada: con ~1 500 millones de parámetros, la capacidad de razonamiento sobre esquemas ambiguos o descripciones de campo poco claras es inherentemente menor que la de modelos mayores.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de equidad en la información disponible.
- Alucinación: el ensamblado programático elimina claves inventadas y errores de sintaxis, pero no evita que el modelo seleccione la opción equivocada dentro del conjunto de candidatos.
- Dependencia de hardware: al estar construido sobre MLX, solo funciona en Apple Silicon con macOS 14.0 o superior; no hay ruta de despliegue en servidores NVIDIA ni en contenedores Linux estándar.
- Falta de validación externa: el repositorio tiene 0 descargas y las cifras de rendimiento proceden únicamente del autor; no hay replicaciones independientes.
- Discrepancia en el nombre: el identificador del repositorio menciona «1B» mientras que el modelo base declarado es de 1,5B, lo que puede inducir a error al dimensionar el despliegue.
- Repositorio incompleto: la model card está truncada en la sección de ejecución del SDK y el comando de clonado apunta a una URL genérica (`github.com/your-org/...`), por lo que el código no es localizable desde la información proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar los términos heredados del modelo base Qwen2.5 en la distribución final.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshatheg/Qwen-2.5-1B-RLCD
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Cuantización de 4 bits usada en los benchmarks: https://huggingface.co/mlx-community/Qwen2.5-1.5B-Instruct-4bit
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/drinkmoonshine/parallel-constrained-decoding
- Repositorio de código: no disponible (la model card indica `https://github.com/your-org/parallel-constrained-decoding.git`, una URL de plantilla sin verificar)
- Paper o publicación técnica: no disponible en la información proporcionada
