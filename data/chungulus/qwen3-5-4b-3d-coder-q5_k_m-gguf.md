# Chungulus/Qwen3.5-4B-3D-Coder-Q5_K_M-GGUF

## Resumen

Qwen3.5-4B-3D-Coder-Q5_K_M-GGUF es una cuantizacion comunitaria en formato GGUF del checkpoint FP16 `ccore/Qwen3.5-4B-3D-Coder`, un ajuste fino de la familia Qwen3.5 orientado a la generacion de codigo para Three.js y contenido 3D en el navegador. La publica el usuario Chungulus bajo licencia Apache 2.0, e incluye el proyector de vision BF16 sin modificar del modelo original, lo que permite entrada de imagen y texto (pipeline `image-text-to-text`) pese a que los pesos de texto se han cuantizado a Q5_K_M.

El modelo resuelve el problema de ejecutar localmente un asistente de codigo especializado en graficos 3D con capacidad multimodal en hardware de consumo. Con 4.205.751.296 parametros en la version de texto (frente a los 4.539.265.536 del checkpoint original con vision), el GGUF ocupa 3,8 GB y esta pensado para llama.cpp con soporte de Qwen3.5, lo que lo hace viable en GPU de gama media y en CPU con RAM suficiente.

Es relevante ahora porque combina tres tendencias: modelos pequenos de codigo con especializacion vertical (Three.js), cuantizacion Q5_K_M que preserva calidad con perdida moderada, y soporte multimodal mediante proyector separado. No obstante, se trata de una cuantizacion no oficial, sin dataset de calibracion ni matriz de importancia, y con validacion limitada a pruebas de sintaxis y comprension de imagen, sin evaluacion de benchmarks de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), con proyector de vision BF16 para entrada multimodal |
| Parametros totales | 4.205.751.296 (texto, GGUF); 4.539.265.536 en el checkpoint FP16 original con vision |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada; los ejemplos de uso emplean `-c 8192` |
| Tipos de cuantizacion | Q5_K_M (unica variante publicada en este repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp), con `mmproj-Qwen3.5-4B-BF16.gguf` para vision |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3.5 de 4B parametros con atencion estandar de transformer; la model card no detalla variantes de atencion lineal ni hibridas. El checkpoint original incluye un proyector de vision que se ha conservado en BF16 dentro del repo GGUF, mientras que los pesos de lenguaje se han cuantizado a Q5_K_M a partir de la exportacion FP16 completa. No se ha aplicado dataset de calibracion, matriz de importancia ni recuantizacion, segun declara el autor de la cuantizacion.

El entrenamiento del modelo base (fine-tune de CCORE) no esta documentado en la informacion disponible: no se especifica numero de tokens, composicion del dataset, ni si hubo RLHF, DPO o fases de instruccion. La model card menciona que la prediccion multi-token (MTP) no se ha exportado, por lo que los frontends que intenten habilitar decodificacion especulativa o MTP deben desactivarla. La validacion realizada por el cuantizador cubre aritmetica, salida JSON y comprension de imagen con el proyector incluido, ademas de una comprobacion de sintaxis JavaScript sobre una escena Three.js generada.

## Capacidades

- Generacion de codigo especializado en Three.js y escenas 3D para navegador, incluyendo geometria, materiales, iluminacion y animacion basica.
- Comprension de imagenes mediante el proyector BF16 incluido (pipeline `image-text-to-text`), util para describir capturas o referencias visuales.
- Generacion de texto conversacional multi-turno en modo chat (`-cnv` en llama.cpp).
- Salida estructurada en JSON, verificada en las pruebas del cuantizador.
- Razonamiento aritmetico basico, segun las comprobaciones declaradas.
- Capacidad de seguir instrucciones de codigo con delimitadores Markdown y entidades HTML, aunque algunas salidas en crudo usan HTML escapado.
- No se documenta soporte explicito de tool calling, function calling ni agentes multi-paso en la informacion disponible.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Prototipado rapido de escenas Three.js: el modelo genera codigo JavaScript listo para pegar en un HTML con el CDN de Three.js, acelerando la creacion de demos de cubos rotatorios, camaras y luces.
- Asistente de codigo en el editor para proyectos de WebGL: al ejecutarse via llama.cpp con `-ngl 99`, puede integrarse en plugins de VS Code o Neovim que consuman un endpoint local compatible con OpenAI.
- Generacion de fragmentos 3D a partir de referencias visuales: usando `llama-mtmd-cli` con una captura o boceto, el modelo describe la imagen y propone la geometria y materiales correspondientes.
- Educacion y tutoriales de graficos 3D: el modelo puede explicar conceptos de Three.js y producir ejemplos comentados para cursos introductorios.
- Automatizacion de pruebas de sintaxis: dado que el cuantizador verifico la sintaxis JavaScript de una escena generada, el modelo encaja en pipelines que generan codigo y lo validan con un linter o parser antes de desplegarlo.
- Despliegue en entornos con GPU limitada: con 3,8 GB de pesos, cabe en GPUs de 8 GB de VRAM y permite inferencia local sin conexion para tareas de codigo 3D.
- Generacion de respuestas JSON para APIs internas: la salida estructurada verificada permite usarlo como extractor o formateador en flujos de backend ligeros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se evaluo la precision en benchmarks, el renderizado en navegador, el video ni el comportamiento con contexto completo. Las unicas comprobaciones son cualitativas: aritmetica, JSON, comprension de imagen y sintaxis JavaScript de una escena de ejemplo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-5 GB con Q5_K_M (3,8 GB de pesos mas overhead de contexto y cache KV); el proyector de vision anade alrededor de 0,5-1 GB adicionales.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 o H100 para mayor throughput; tambien funciona en GPUs de 8 GB con contexto moderado.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM, y en CPU con al menos 8 GB de RAM usando cuantizacion Q5_K_M.
- Opciones de despliegue: llama.cpp (build reciente con soporte Qwen3.5, probado con el commit `6414d5b0c9e5895473036c90c2bd305ce4ceccc4`), `llama-completion` para texto y `llama-mtmd-cli` para vision. No se documenta compatibilidad con vLLM, TGI u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. El autor no publica mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-3D-Coder-Q5_K_M-GGUF (este) | 4,2B (texto) | no disponible | Apache 2.0 | GGUF | Cuantizacion comunitaria, vision incluida, especializado en Three.js |
| ccore/Qwen3.5-4B-3D-Coder (base) | 4,54B (con vision) | no disponible | Apache 2.0 | safetensors (FP16) | Checkpoint original, mayor precision, requiere mas VRAM |
| Qwen2.5-Coder-3B (referencia de familia) | 3,1B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Codigo generalista, sin especializacion 3D ni vision |
| Qwen2.5-Coder-7B (referencia de familia) | 7,6B | 32K (segun documentacion publica de Qwen) | Apache 2.0 | safetensors, GGUF | Mayor capacidad de codigo, requiere mas VRAM |

La comparativa con modelos de la familia Qwen2.5-Coder se ofrece como referencia de categoria; no se dispone de datos de rendimiento del modelo evaluado frente a ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Cuantizacion no oficial: es una conversion comunitaria de Chungulus, no un release de Qwen ni de CCORE; la calidad puede diferir del checkpoint FP16 original.
- Sin dataset de calibracion ni matriz de importancia: la cuantizacion Q5_K_M se aplico de forma directa, lo que puede degradar mas la precision en tareas sensibles que una cuantizacion calibrada.
- Validacion limitada: no se evaluaron benchmarks de precision, renderizado en navegador, video ni comportamiento con contexto completo; las pruebas son de sintaxis y funcionalidad basica.
- MTP desactivado: la prediccion multi-token no se exporta, por lo que hay que deshabilitar MTP y decodificacion especulativa en los frontends.
- Salidas con HTML escapado: algunas respuestas en crudo usan entidades HTML, lo que exige normalizacion antes de usar el codigo generado.
- Riesgo de alucinacion: como todo modelo de 4B, puede inventar APIs de Three.js inexistentes o firmas de funciones incorrectas; se recomienda validar el codigo con un linter y pruebas en navegador.
- Idiomas no documentados: no se especifica que lenguas soporta; el uso principal parece ser ingles.
- Contexto no documentado: la model card no declara la ventana nativa; los ejemplos usan 8192 tokens, y no se garantiza comportamiento correcto mas alla.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantizacion comunitaria conviene verificar los terminos del modelo base y del proyector de vision incluido.
- Sin soporte documentado de tool calling ni agentes: no disenado para flujos agenticos complejos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Chungulus/Qwen3.5-4B-3D-Coder-Q5_K_M-GGUF
- Modelo base (checkpoint FP16): https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder
- Revision concreta del checkpoint base citada en la model card: https://huggingface.co/ccore/Qwen3.5-4B-3D-Coder/tree/16f53e560115a3f55ddf7b455d65417257e29414
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
- Three.js (libreria objetivo del modelo): https://threejs.org
