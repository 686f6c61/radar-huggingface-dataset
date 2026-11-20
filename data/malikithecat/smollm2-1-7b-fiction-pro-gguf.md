# malikithecat/SmolLM2-1.7B-Fiction-Pro-GGUF

## Resumen

SmolLM2-1.7B-Fiction-Pro-GGUF es una cuantización en formato GGUF de un ajuste fino (fine-tuning) del modelo SmolLM2-1.7B-Instruct de Hugging Face, publicado por el usuario malikithecat. El modelo base SmolLM2 pertenece a la familia SmolLM2 de Hugging Face, una serie de modelos pequeños diseñados para ejecutarse en hardware modesto, y en esta variante se ha especializado en la generación de narrativa de ficción ("Fiction-Pro"). El resultado se ha convertido a GGUF mediante la herramienta Unsloth para facilitar su ejecución con llama.cpp y ecosistemas compatibles.

El repositorio contiene un único archivo de pesos en cuantización Q8_0, lo que da un tamaño aproximado de 1,8 GB, coherente con un modelo de 1.711.376.384 parámetros cuantizado a 8 bits. La model card es extremadamente escueta: no documenta el conjunto de datos de ajuste fino, no detalla hiperparámetros de entrenamiento ni incluye resultados de evaluación. La información disponible se limita a los metadatos del repositorio y a las instrucciones de uso con llama-cli.

Se trata, por tanto, de un modelo experimental de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a la escritura creativa y la narrativa conversacional. No debe confundirse con un modelo oficial de Hugging Face: es una derivación comunitaria del SmolLM2 base, sin garantías de calidad ni soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM2) |
| Parametros totales | 1.711.376.384 (~1,7 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el SmolLM2 base soporta 8.192 tokens, no confirmado para este ajuste) |
| Tipos de cuantizacion | Q8_0 (único archivo publicado) |
| Idiomas soportados | no disponible (el SmolLM2 base es predominantemente inglés) |
| Licencia | no disponible |
| Formato de pesos | GGUF (archivo `SmolLM2-1.7B-Instruct.Q8_0.gguf`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de SmolLM2-1.7B, un transformer decoder-only denso de aproximadamente 1,7 mil millones de parámetros. Sobre ese modelo base (en su variante Instruct) el autor aplicó un ajuste fino adicional orientado a ficción, presumiblemente con datos narrativos propios, y posteriormente realizó la conversión a GGUF utilizando Unsloth. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o SFT.

No se documenta ninguna innovación arquitectónica adicional respecto al modelo base. Tampoco se indica la longitud de contexto efectiva tras el ajuste fino ni si se modificó el tokenizador. La única información técnica verificable es el proceso de cuantización a Q8_0 y la compatibilidad con llama.cpp, incluyendo el uso de la plantilla de chat Jinja mediante el flag `--jinja`.

## Capacidades

- Generación de texto narrativo y de ficción: es el propósito declarado del ajuste fino, orientado a relatos, diálogos y prosa creativa.
- Conversación multi-turno: heredada del modelo Instruct base, con soporte de plantilla de chat Jinja.
- Generación de texto general: razonamiento básico, resúmenes y respuesta a instrucciones simples, limitado por el tamaño del modelo.
- Soporte de tool calling / function calling: no documentado; no se puede confirmar.
- Soporte de agentes y razonamiento multi-paso: no documentado; improbable en un modelo de 1,7 B sin entrenamiento específico.
- Capacidades multilingües: no documentadas; el modelo base SmolLM2 está entrenado principalmente en inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponibles. La mención a `llama-mtmd-cli` en la model card es genérica y no implica soporte multimodal real.

## Casos de uso

- Escritura creativa asistida: generación de borradores de relatos cortos, capítulos o escenas de ficción, aprovechando el ajuste específico del modelo sobre narrativa y su bajo coste de ejecución en local.
- Prototipado de chatbots de rol: creación de personajes conversacionales para juegos de rol de texto o demos interactivas, donde el contexto requerido es moderado y la latencia importa más que la profundidad de razonamiento.
- Generación de contenido para juegos indie: diálogos de PNJ (personajes no jugadores) o descripciones de objetos y entornos en proyectos de bajo presupuesto que necesitan inferencia en CPU o GPU de gama baja.
- Herramienta de escritura offline: integración en editores o plugins que funcionen sin conexión, dado el formato GGUF y su ejecución mediante llama.cpp en portátiles convencionales.
- Experimentación académica con fine-tuning: uso como caso de estudio de ajuste fino de modelos pequeños para dominios creativos, comparando el comportamiento del modelo ajustado frente al SmolLM2-Instruct original.
- Generación de texto en dispositivos con recursos limitados: despliegue en entornos embebidos o máquinas sin GPU dedicada, donde un modelo de 1,7 B cuantizado a 8 bits ocupa menos de 2 GB de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2 GB para el archivo Q8_0 (1,8 GB de pesos más overhead de contexto y caché KV).
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM; RTX 3050, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para GPUs de数据中心.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU de consumo moderna (GTX 1650 en adelante) e incluso en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama (mediante importación del GGUF), y cualquier runtime compatible con GGUF. La model card menciona `endpoints_compatible`, lo que sugiere compatibilidad con endpoints tipo OpenAI a través de llama.cpp.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SmolLM2-1.7B-Fiction-Pro-GGUF | 1,7 B | no disponible | no disponible | GGUF Q8_0 | Ajuste comunitario para ficción, sin benchmarks |
| SmolLM2-1.7B-Instruct (oficial) | 1,7 B | 8.192 tokens | Apache 2.0 | safetensors, GGUF | Modelo base oficial, con evaluación publicada |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens | Apache 2.0 | safetensors, GGUF | Alternativa multilingüe con contexto amplio |
| Llama-3.2-1B-Instruct | 1,2 B | 128.000 tokens | Llama 3.2 Community License | safetensors, GGUF | Contexto muy superior y ecosistema maduro |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al heredar el modelo base SmolLM2, es probable que arrastre sesgos de los datos de preentrenamiento, pero no hay evaluación específica.
- Riesgo de alucinación: alto, como en cualquier modelo de 1,7 B; el ajuste fino para ficción puede incrementar la propensión a inventar detalles factuales si se usa fuera de su dominio.
- Limitaciones de contexto e idioma: la longitud de contexto efectiva no está confirmada; el modelo base es predominantemente inglés y el ajuste fino no documenta soporte multilingüe.
- Restricciones de licencia: la licencia no está especificada en el repositorio, lo que impide confirmar si el uso comercial está permitido. Se recomienda contactar con el autor antes de cualquier despliegue en producción.
- Caveats para producción: cero descargas y cero likes indican ausencia de validación comunitaria; no hay benchmarks, ni documentación de datos de entrenamiento, ni garantías de calidad. No es adecuado para aplicaciones críticas sin una evaluación propia exhaustiva.
- El nombre del archivo (`SmolLM2-1.7B-Instruct.Q8_0.gguf`) no coincide exactamente con el nombre del repositorio (`Fiction-Pro`), lo que puede generar confusión al gestionar versiones.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/malikithecat/SmolLM2-1.7B-Fiction-Pro-GGUF
- Modelo base SmolLM2-1.7B-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-1.7B-Instruct
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- llama.cpp: https://github.com/ggml-org/llama.cpp
