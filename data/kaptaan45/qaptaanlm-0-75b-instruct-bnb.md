# kaptaan45/QaptaanLM-0.75B-Instruct-BnB

## Resumen

QaptaanLM-0.75B-Instruct-BnB es un conjunto de pesos cuantizados con BitsAndBytes del modelo QaptaanLM-0.75B-Instruct, un modelo de lenguaje de 752 millones de parámetros derivado de Qwen3.5-0.8B-Base, especializado en generación de código, razonamiento técnico y seguimiento de instrucciones. El autor, kaptaan45, publica este repositorio como una suite unificada que incluye dos versiones cuantizadas: 4-bit NormalFloat (NF4) con doble cuantización y 8-bit Int8 (LLM.int8()), pensadas para reducir el consumo de VRAM y permitir la ejecución en hardware modesto.

El modelo base fue entrenado mediante un pipeline de dos fases (CPT y SFT) documentado en GitHub, utilizando el dataset KapInstruct-100M para el ajuste por instrucciones. Este repositorio BnB no añade capacidades nuevas, sino que ofrece una vía de despliegue eficiente para entornos con restricciones de memoria. Su relevancia radica en que permite ejecutar un asistente de código funcional en GPUs de gama baja o incluso en CPU mediante la versión GGUF complementaria, lo que democratiza el acceso a modelos de IA generativa especializados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atencion lineal (segun etiqueta del modelo; no confirmado) |
| Parametros totales | 752 millones (segun repositorio GitHub) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4-bit NF4 con doble cuantizacion (BF16 compute) y 8-bit Int8 (LLM.int8()) |
| Idiomas soportados | Ingles y codigo |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (subcarpetas `4bit/` y `8bit/`) |

## Arquitectura y entrenamiento

El modelo base QaptaanLM-0.75B-Instruct se construye a partir de Qwen3.5-0.8B-Base mediante un pipeline de fine-tuning en dos fases: primero un entrenamiento continuo (CPT) sobre datos tecnicos y de codigo, y posteriormente un ajuste supervisado (SFT) con el dataset KapInstruct-100M, que sigue la plantilla de chat ChatML de Qwen. El tag `linear-attention` sugiere que la arquitectura emplea atencion lineal, aunque no se proporcionan detalles tecnicos adicionales en la documentacion disponible.

Este repositorio concreto no modifica la arquitectura ni los pesos del modelo base; simplemente aplica cuantizacion BitsAndBytes. La version 4-bit usa NormalFloat (NF4) con doble cuantizacion y tipo de computo BFloat16, mientras que la version 8-bit emplea el esquema LLM.int8(). Ambas se cargan mediante `transformers` con `trust_remote_code=True`, lo que indica que el modelo requiere codigo personalizado para su correcta inicializacion.

## Capacidades

- Generacion de texto y codigo en ingles, con especial enfasis en tareas de programacion (funciones, algoritmos, depuracion).
- Razonamiento tecnico y seguimiento de instrucciones, gracias al ajuste con KapInstruct-100M.
- Soporte de formato de chat ChatML (system, user, assistant) para interacciones multi-turno.
- Capacidad de ejecucion en entornos con poca VRAM gracias a la cuantizacion (550 MB en 4-bit, 850 MB en 8-bit).
- No se documenta soporte explicito de tool calling, agentes, vision ni audio.
- Limitado a ingles y codigo; no es multilingue.

## Casos de uso

- Asistente de codigo en entornos de desarrollo integrado (IDE) ligeros: el modelo puede completar funciones, explicar fragmentos y sugerir correcciones, funcionando en maquinas sin GPU dedicada gracias a la cuantizacion 4-bit.
- Autocompletado de codigo en editores basados en terminal (Neovim, VS Code remoto): su tamano reducido permite una latencia aceptable incluso en CPU si se usa la version GGUF complementaria.
- Generacion de documentacion tecnica: dado su entrenamiento en codigo, puede redactar comentarios, docstrings y READMEs a partir de firmas de funciones o bloques de codigo.
- Chatbot de soporte tecnico en ingles: integrable en sistemas de atencion al cliente para resolver dudas de programacion, con la ventaja de poder desplegarse en servidores de bajo coste.
- Prototipado rapido de aplicaciones NLP: su licencia Apache 2.0 y su formato safetensors permiten integrarlo en pipelines de prueba sin restricciones comerciales.
- Fine-tuning adicional con PEFT: al ser un modelo pequeno, es adecuado para adaptarlo a dominios especificos (por ejemplo, SQL o configuracion de redes) con recursos limitados, usando LoRA u otros metodos de ajuste eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar para este modelo.

## Requisitos de hardware

- VRAM estimada: 550 MB para la version 4-bit NF4 y 850 MB para la version 8-bit Int8, segun la model card.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como GTX 1050, GTX 1650, RTX 3050 o integradas modernas. Tambien puede ejecutarse en CPU mediante la version GGUF (repositorio separado) con llama.cpp u Ollama.
- Opciones de despliegue: `transformers` con `bitsandbytes` para carga en Python; para entornos sin GPU, se recomienda el repositorio GGUF con llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. Al ser un modelo de 0.75B, se espera una generacion de decenas de tokens por segundo en GPU modernas, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoria. El modelo base Qwen3.5-0.8B-Base podria considerarse un punto de referencia, pero no se han publicado resultados comparativos. Alternativas como CodeGen-350M o StarCoderBase-1B existen en el espacio de modelos de codigo pequenos, pero no hay datos de rendimiento disponibles para QaptaanLM que permitan una comparacion objetiva.

## Limitaciones y advertencias

- Tamano reducido (0.75B): su capacidad de razonamiento complejo y de manejo de contextos largos es limitada en comparacion con modelos de mayor escala.
- Solo ingles y codigo: no soporta otros idiomas, lo que restringe su uso en entornos multilingues.
- Riesgo de alucinacion: como todo LLM, puede generar codigo incorrecto o respuestas inventadas, especialmente en tareas poco representadas en su entrenamiento.
- Cuantizacion: la version 4-bit puede degradar ligeramente la precision en tareas delicadas; la version 8-bit es casi sin perdidas, pero consume mas VRAM.
- Dependencia de codigo remoto: el uso de `trust_remote_code=True` implica ejecutar codigo del autor, lo que requiere auditoria de seguridad en entornos de produccion.
- Sin informacion sobre sesgos: no se han documentado evaluaciones de sesgo o toxicidad.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base deriva de Qwen, cuyos terminos de uso deben verificarse para cumplimiento adicional.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/kaptaan45/QaptaanLM-0.75B-Instruct-BnB
- Modelo base (sin cuantizar): https://huggingface.co/kaptaan45/QaptaanLM-0.75B-Instruct
- Version GGUF para inferencia en CPU: https://huggingface.co/kaptaan45/QaptaanLM-0.75B-Instruct-GGUF
- Repositorio GitHub con el pipeline de entrenamiento: https://github.com/rudy-07/QaptaanLM-0.75B
- Dataset KapInstruct-100M en Kaggle: https://www.kaggle.com/datasets/kaptaan45/kapinstruct-100m
