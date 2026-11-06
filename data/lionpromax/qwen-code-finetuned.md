# lionpromax/qwen-code-finetuned

## Resumen

QwenCoder 3B Custom v1 es un ajuste fino experimental orientado a codigo sobre Qwen2.5-Coder-3B-Instruct, publicado por el usuario lionpromax en Hugging Face. No se trata de un modelo entrenado desde cero, sino de un fine-tune con QLoRA/LoRA (rango 16) sobre el modelo base de Alibaba, con un conjunto de entrenamiento muy reducido: 1.024 ejemplos muestreados de dos datasets publicos de instrucciones de codigo (Magicoder OSS Instruct 75K y CodeFeedback Filtered Instruction), durante una sola epoca y 128 pasos sobre una GPU NVIDIA Tesla T4.

El modelo conserva la arquitectura Qwen2 del original, con 3.085.938.688 parametros (aproximadamente 3,1 mil millones) y una ventana de contexto que hereda del modelo base. Se distribuye en dos formatos: pesos fusionados en FP16 en el directorio raiz (compatibles con Transformers) y una cuantizacion GGUF Q4_K_M de aproximadamente 1,8 GB en el subdirectorio `gguf`, con un Modelfile para Ollama.

Su relevancia es limitada y de caracter practico: sirve como ejemplo de pipeline de fine-tuning ligero con Unsloth sobre hardware de consumo, y como modelo pequeno de codigo desplegable en local. No debe confundirse con un modelo de produccion: el propio autor lo describe como experimental y advierte de que el codigo generado requiere revision y pruebas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (transformer decoder-only) |
| Parametros totales | 3.085.938.688 (aproximadamente 3,1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-Coder-3B-Instruct) |
| Tipos de cuantizacion | FP16 (pesos fusionados) y GGUF Q4_K_M |
| Idiomas soportados | en, ru |
| Licencia | qwen-research (etiquetada como "other") |
| Formato de pesos | safetensors (FP16) y GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con la arquitectura Qwen2, identica a la del modelo base Qwen2.5-Coder-3B-Instruct. El ajuste se realizo mediante QLoRA/LoRA con rango 16, una sola epoca y 128 pasos de entrenamiento sobre una NVIDIA Tesla T4. Los pesos resultantes se fusionaron en FP16 y posteriormente se genero una version cuantizada Q4_K_M en formato GGUF.

El conjunto de entrenamiento final consta de 1.024 ejemplos muestreados de la combinacion de Magicoder OSS Instruct 75K (ise-uiuc) y CodeFeedback Filtered Instruction (m-a-p). No se documenta el numero total de tokens de entrenamiento, la composicion exacta del muestreo ni si hubo etapas de RLHF o DPO adicionales; el autor solo indica el fine-tuning supervisado descrito. No se menciona ninguna innovacion tecnica destacable (decodificacion especulativa, atencion lineal, etc.) mas alla del uso de Unsloth para el entrenamiento eficiente en memoria.

## Capacidades

- Generacion de codigo en varios lenguajes, heredada del modelo base Qwen2.5-Coder-3B-Instruct, con pruebas manuales preliminares en Python (generacion de Fibonacci) y C++ (eliminacion de duplicados).
- Generacion de texto conversacional e instrucciones, ya que el modelo base es una variante Instruct.
- Generacion en ruso: el autor reporta que una prueba manual de generacion en ruso paso.
- Idiomas declarados: ingles y ruso (en, ru).
- Compatibilidad con tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking, vision, audio): no disponible; el modelo no declara ninguna.

## Casos de uso

- Asistente de codigo en local para desarrolladores individuales: el GGUF Q4_K_M de aproximadamente 1,8 GB cabe en GPUs de consumo y permite autocompletado y generacion de funciones en un portatil, sin dependencia de la nube.
- Prototipado rapido de scripts en Python: util para generar borradores de funciones sencillas (por ejemplo, algoritmos clasicos como Fibonacci) que el desarrollador revisa y prueba despues.
- Evaluacion de pipelines de fine-tuning: sirve como caso de referencia para reproducir un flujo QLoRA con Unsloth sobre una T4 y comparar el efecto de un dataset pequeno frente al modelo base.
- Despliegue con Ollama en entornos de pruebas: el Modelfile incluido permite levantar el modelo con un solo comando para experimentar con prompts de codigo en ingles y ruso.
- Generacion de texto tecnico bilingue ingles-ruso: para documentacion o comentarios de codigo en esos dos idiomas, con revision humana obligatoria.
- Base para experimentos de cuantizacion: el par FP16/GGUF Q4_K_M permite medir la degradacion de calidad en tareas de codigo al cuantizar a 4 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta pruebas manuales preliminares con la version GGUF cargada en llama.cpp: generacion de Fibonacci en Python (superada), generacion en ruso (superada) y eliminacion de duplicados en C++ (fallida, no preservo el orden original de los elementos). Estas pruebas no constituyen una evaluacion formal.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB con GGUF Q4_K_M; alrededor de 6-7 GB con pesos FP16 (3,1 B parametros a 2 bytes por parametro mas overhead de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para la version Q4_K_M; una NVIDIA Tesla T4 (16 GB) fue la GPU usada para el entrenamiento y es suficiente para inferencia en FP16.
- Cabe en GPU de consumo: si, la version Q4_K_M cabe en GPUs de gama entrada y media (por ejemplo, GTX 1650, RTX 3050, RTX 4060); la version FP16 requiere al menos 8 GB de VRAM.
- Opciones de despliegue: llama.cpp y Ollama (via el Modelfile incluido en `gguf`), y Hugging Face Transformers para los pesos FP16. No se documenta compatibilidad con vLLM o TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| lionpromax/qwen-code-finetuned | 3,1 B | no disponible | qwen-research | safetensors, GGUF | Fine-tune experimental con 1.024 ejemplos; sin benchmarks |
| Qwen/Qwen2.5-Coder-3B-Instruct | 3,1 B | no disponible en la informacion proporcionada | qwen-research | safetensors, GGUF | Modelo base; entrenamiento completo de Alibaba, con evaluaciones publicadas por el autor original |
| Modelos de codigo de tamano similar (por ejemplo, variantes de 3B de la familia Qwen2.5-Coder) | 3,1 B | no disponible | qwen-research | safetensors, GGUF | Alternativas directas dentro de la misma familia |

La comparacion cuantitativa de rendimiento no esta disponible: el fine-tune no publica benchmarks y no hay datos que permitan afirmar mejora o degradacion frente al modelo base.

## Limitaciones y advertencias

- Modelo experimental: el autor lo describe explicitamente como un fine-tune pequeno y experimental, no como un modelo de produccion.
- Dataset de entrenamiento muy reducido (1.024 ejemplos, 1 epoca, 128 pasos), lo que limita el impacto real del ajuste y aumenta el riesgo de sobreajuste a esos ejemplos.
- Prueba fallida documentada: en la tarea de eliminacion de duplicados en C++ no preservo el orden original de los elementos.
- Riesgo de alucinacion y de codigo incorrecto: el autor advierte de que el codigo generado debe revisarse y probarse antes de usarlo.
- Idiomas limitados a ingles y ruso; no se declara soporte de castellano.
- Licencia qwen-research: es necesario revisar la licencia del modelo base antes de redistribuir o usar comercialmente; los datasets de entrenamiento tienen sus propias licencias y condiciones.
- Sin benchmarks formales publicados, por lo que no hay evidencia cuantitativa de calidad frente al modelo base.
- No se documenta soporte de tool calling, agentes ni contexto largo mas alla del heredado del modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lionpromax/qwen-code-finetuned
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Dataset Magicoder OSS Instruct 75K: https://huggingface.co/datasets/ise-uiuc/Magicoder-OSS-Instruct-75K
- Dataset CodeFeedback Filtered Instruction: https://huggingface.co/datasets/m-a-p/CodeFeedback-Filtered-Instruction
