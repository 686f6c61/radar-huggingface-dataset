# lailaba/lailaba-ai

## Resumen
Lailaba AI es un modelo de lenguaje causal de tipo transformer desarrollado por Abdullahi Ibrahim Lailaba, vinculado a la Federal University Birnin Kebbi. Se trata de un ajuste fino del modelo base Qwen3-0.6B, distribuido como checkpoint completo (no como adaptador LoRA) y orientado a tareas de programacion, tecnologia, educacion, investigacion y ciberseguridad defensiva. El modelo tiene 596.049.920 parametros y un tamano de repositorio de 2,5 GB en formato safetensors.

El modelo se presenta como una version experimental (v1) pensada para experimentacion y asistencia tecnica, no para produccion critica. Su tamano compacto lo hace adecuado para despliegues en hardware modesto, aunque limita su capacidad de razonamiento complejo e instrucciones largas. La licencia Apache 2.0 permite uso comercial y modificacion sin restricciones adicionales.

La relevancia actual del modelo radica en su especializacion tematica (programacion y ciberseguridad) sobre una base Qwen3 pequena, lo que puede resultar util para entornos educativos o herramientas de desarrollador con requisitos de recursos reducidos. No obstante, no se han publicado resultados de benchmarks que respalden sus capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 (transformer causal) |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se puede cuantizar con herramientas externas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo se basa en la arquitectura Qwen3, concretamente en el checkpoint Qwen3-0.6B, y se distribuye como un modelo completo con pesos y configuracion para su uso con Transformers. Es un modelo de lenguaje causal (autoregresivo) de tipo transformer, sin que la model card detalle innovaciones adicionales como atencion lineal o decodificacion especulativa.

No se proporciona informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card indica que el modelo fue "customizado" para dominios tecnicos, pero no especifica la metodologia de ajuste fino ni los datos utilizados. Tampoco se detalla si se congelaron capas o se realizo un fine-tuning completo.

## Capacidades
- Generacion de texto y respuestas conversacionales en dominios tecnicos.
- Asistencia en programacion: Python, desarrollo web, APIs y desarrollo de software.
- Explicaciones sobre inteligencia artificial y machine learning.
- Soporte para temas de Linux, herramientas de linea de comandos y cloud computing.
- Educacion en ciberseguridad defensiva y conceptos de seguridad en redes.
- Uso como base para aplicaciones de chat y herramientas educativas.
- Posibilidad de ajuste fino adicional para tareas especializadas.
- No se documenta soporte explicito de tool calling, function calling ni razonamiento multi-paso.
- No se documenta soporte multilingue ni capacidades de vision o audio.

## Casos de uso
- Asistencia en programacion para desarrolladores: el modelo puede generar fragmentos de codigo en Python y explicar conceptos de APIs y desarrollo web, adecuado para entornos de formacion o prototipado rapido.
- Educacion tecnica: puede emplearse como tutor para explicar conceptos de inteligencia artificial, Linux o cloud computing en cursos introductorios, gracias a su especializacion tematica.
- Formacion en ciberseguridad defensiva: util para explorar conceptos de seguridad en redes y programacion segura en laboratorios educativos, con la advertencia de validar siempre las respuestas.
- Herramientas de desarrollador autoalojadas: su tamano reducido permite integrarlo en asistentes de chat o utilidades de linea de comandos que se ejecuten en servidores modestos.
- Base para fine-tuning especializado: al ser un checkpoint completo con licencia Apache 2.0, puede servir como punto de partida para ajustes en dominios concretos sin restricciones de licencia.
- Prototipado de aplicaciones conversacionales: su plantilla de chat integrada facilita la creacion de demos de asistentes tecnicos con requisitos de hardware bajos.
- Documentacion tecnica automatizada: puede generar explicaciones basicas de conceptos de software y tecnologia para manuales o articulos, sujeto a revision humana.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se hacen afirmaciones de rendimiento y que las evaluaciones formales aun no se han publicado.

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 1,2 GB solo para pesos, mas overhead de activaciones y cache KV (estimacion orientativa; no confirmada por el autor).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,6 GB; en 4 bits: alrededor de 0,3 GB (estimaciones orientativas).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) para FP16; para cuantizacion, GPUs con 2-4 GB pueden ser suficientes.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas e incluso en algunas integradas con suficiente memoria compartida.
- Opciones de despliegue: Transformers (segun la model card), y previsiblemente llama.cpp, Ollama o vLLM si se generan los formatos adecuados (no confirmado por el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Lailaba AI | 596 M | no disponible | Apache 2.0 | Hugging Face |
| Qwen3-0.6B (base) | 596 M | no disponible en la informacion | Apache 2.0 | Hugging Face |
| Modelos similares de ~0,5B (p. ej., Qwen2.5-0.5B) | ~500 M | no disponible en la informacion | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo para Lailaba AI frente a alternativas, por lo que la comparativa se limita a parametros y licencia. El modelo base Qwen3-0.6B es la referencia directa, y Lailaba AI se presenta como un ajuste especializado del mismo.

## Limitaciones y advertencias
- Modelo experimental (v1): no apto para decisiones criticas sin revision humana.
- Tamano reducido (596 M): capacidad limitada para razonamiento complejo, instrucciones largas y tareas avanzadas de programacion.
- Riesgo de alucinacion: puede generar informacion incorrecta o afirmaciones no respaldadas.
- Puede producir codigo con errores o vulnerabilidades de seguridad; se debe revisar y probar antes de usarlo.
- No se documentan sesgos especificos, pero al derivar de Qwen3 puede heredar sesgos del modelo base.
- Idiomas soportados no documentados; se desconoce su rendimiento en castellano u otros idiomas distintos del ingles.
- Longitud de contexto no documentada; no se puede garantizar el manejo de conversaciones o documentos extensos.
- La model card advierte que el uso en ciberseguridad debe ser autorizado y conforme a las leyes.
- Licencia Apache 2.0 permite uso comercial, pero no se ofrece garantia alguna por parte del autor.
- No se han publicado benchmarks que validen las capacidades declaradas.

## Enlaces
- Hugging Face: https://huggingface.co/lailaba/lailaba-ai
- GitHub (proyecto relacionado): https://github.com/abstryaproject/lailaba-ai
