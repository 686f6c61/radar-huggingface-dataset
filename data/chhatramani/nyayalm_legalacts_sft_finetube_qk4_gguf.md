# chhatramani/nyayalm_legalacts_sft_finetube_qk4_gguf

## Resumen

El modelo `chhatramani/nyayalm_legalacts_sft_finetube_qk4_gguf` es un adaptador de Qwen3 1.7B (arquitectura transformer decoder-only) afinado para tareas legales, publicado por el usuario chhatramani (Chhatramani Yadav) en formato GGUF. El nombre sugiere que se trata de un ajuste fino supervisado sobre actos legales, probablemente en el contexto del proyecto NyayaLM, cuyo objetivo declarado es democratizar el acceso a la información legal en Nepal mediante modelos que funcionan sin conexión en ordenadores personales.

El archivo `qwen3-1.7b.Q4_K_M.gguf` pesa aproximadamente 1,1 GB y está cuantizado en Q4_K_M, lo que permite su ejecución en hardware modesto. La model card indica que fue entrenado con Unsloth y que se incluye un Modelfile de Ollama para facilitar su despliegue. Sin embargo, la información pública disponible es escasa: no se especifican el dataset de entrenamiento, la licencia ni los idiomas soportados, aunque por el contexto del proyecto NyayaLM se presume que el modelo está orientado a consultas legales en nepalí e inglés, aunque esta afirmación no está confirmada en la ficha actual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer decoder-only) |
| Parametros totales | 1.720.574.976 (aprox. 1,72B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen3 1.7B soporta 32K tokens, pero no se confirma en esta variante) |
| Tipos de cuantizacion | Q4_K_M (archivo `qwen3-1.7b.Q4_K_M.gguf`) |
| Idiomas soportados | No disponible (probablemente nepalés e inglés, no confirmado) |
| Licencia | No disponible |
| Formato de pesos | GGUF (con safetensors originales en el repo, pero el archivo publicado es GGUF) |

## Arquitectura y entrenamiento

El modelo es un finetune de Qwen3 1.7B, un transformer decoder-only con atención por ventana deslizante y soporte para tool calling (característica de la familia Qwen3). El entrenamiento se realizó mediante supervisión fina (SFT) sobre actos legales, y el proceso de conversión a GGUF se hizo con Unsloth, que acelera el entrenamiento y la cuantización. No se han publicado detalles sobre el dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. La única información técnica disponible es que se entrenó con Unsloth y que el resultado se convirtió a GGUF con cuantización Q4_K_M.

## Capacidades

- Generación de texto en formato conversacional (tag `conversational`).
- Probablemente especializado en información legal y actos legislativos, aunque no hay evidencia pública de las tareas exactas.
- Soporta el pipeline estándar de llama.cpp y Ollama, por lo que puede usarse en entornos locales.
- No hay indicios de tool calling, funciones, visión o modos de pensamiento (thinking) en la información proporcionada.

## Casos de uso

- **Asistencia legal ciudadana en nepalí**: el modelo está diseñado para responder preguntas sobre actos legales en Nepal, siguiendo el propósito del proyecto NyayaLM. Se desplegaría con Ollama en un ordenador personal para ofrecer información jurídica básica sin conexión.
- **Consulta de documentos legales**: se puede usar para resumir o extraer puntos clave de textos legales, aunque no se ha validado su precisión.
- **Educación legal**: como herramienta de apoyo para estudiantes de derecho que necesitan explicaciones de conceptos legales.
- **Chatbot institucional**: integración en un sitio web o aplicación para responder preguntas frecuentes sobre trámites legales.
- **Prototipado rápido**: al ser un modelo pequeño en GGUF, sirve para prototipar soluciones de IA legal en hardware limitado antes de pasar a modelos más grandes.
- **Investigación en IA accesible**: como ejemplo de fine-tuning eficiente con Unsloth, útil para estudiar técnicas de adaptación en entornos con pocos recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo concreto.

## Requisitos de hardware

- El archivo GGUF pesa 1,1 GB, lo que implica que la VRAM necesaria para inferencia es aproximadamente 1,5-2 GB (considerando el peso y los buffers de contexto).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, GTX 1650, RTX 3050, Apple M1) o CPU con 8 GB de RAM.
- Se puede ejecutar en CPU con llama.cpp o Ollama sin problema, con latencia de unos pocos tokens por segundo en hardware moderno.
- Despliegue compatible con llama.cpp (`llama-cli`), Ollama (incluye Modelfile) y servidores compatibles con el endpoint de llama.cpp.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. El modelo es un finetune de Qwen3 1.7B, y no se conocen modelos legales específicos para nepalí en GGUF con los que comparar.

## Limitaciones y advertencias

- Al ser un modelo de 1,7B, su capacidad de razonamiento y de precisión en tareas legales es limitada; puede alucinar o dar respuestas incorrectas.
- No hay licencia declarada, por lo que el uso comercial no está claramente permitido.
- No se ha publicado el dataset de entrenamiento, por lo que no se pueden evaluar sesgos ni la cobertura de actos legales.
- El modelo está orientado probablemente al nepalí, pero no se ha confirmado su calidad en otros idiomas.
- No se han publicado evaluaciones de seguridad ni de sesgos.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/chhatramani/nyayalm_legalacts_sft_finetube_qk4_gguf)
- [Perfil del autor en Hugging Face](https://huggingface.co/chhatramani)
- [Repositorio GitHub de NyayaLM v0.5 (Gemma 3n)](https://github.com/chhatramani01/NyayaLM_v0.5_Gemma3n4B-4bit)
- [Sitio web de NyayaLM](https://www.nyayam.org/)
