# laabamone/laabam-ai-3b-v1-gguf

## Resumen

Agni Lite 3B v1 GGUF es la versión cuantizada del modelo Agni Lite 3B v1, un ajuste fino de Qwen2.5-3B-Instruct desarrollado por Laabam One Business Solutions (OPC) Private Limited, una empresa india. El modelo está orientado a conversación multilingüe con soporte nativo de hindi, tamil, telugu, kannada e inglés, además de generación de código y razonamiento básico. La versión GGUF está pensada para despliegue local en portátiles, dispositivos de borde y entornos sin GPU dedicada mediante llama.cpp, Ollama o LM Studio.

El modelo parte de la arquitectura Qwen2.5 de 3.085.938.688 parámetros y se ha adaptado mediante QLoRA (r=16, alpha=32, cuantización 4-bit NF4) con la herramienta Unsloth sobre aproximadamente 98.000 muestras multilingües curadas. El resultado es un modelo compacto que prioriza el soporte de lenguas índicas sobre un backbone ya competente en inglés y código.

Su relevancia actual radica en la combinación de tamaño reducido (1,8 GB en Q4_K_M), licencia comunitaria propia y compatibilidad directa con el ecosistema llama.cpp. Es una opción realista para organizaciones que necesitan un asistente local en lenguas del sur de la India sin depender de infraestructura cloud ni de modelos propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el backbone Qwen2.5-3B-Instruct soporta hasta 32.768 tokens; los ejemplos de la model card usan n_ctx=1024) |
| Tipos de cuantización | Q4_K_M, BF16 |
| Idiomas soportados | en, hi, te, kn, ta |
| Licencia | agni-community (propietaria, ver LICENSE-AGNI-COMMUNITY.md) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal estándar, y hereda la tokenización y el chat template de Qwen2.5-3B-Instruct (formato ChatML con `<|im_start|>` y `<|im_end|>`). El ajuste se realizó mediante QLoRA con rango 16, alpha 32 y cuantización 4-bit NF4, empleando Unsloth como framework de entrenamiento. El conjunto de datos de ajuste consistió en aproximadamente 98.000 muestras multilingües curadas, con énfasis en hindi, tamil, telugu, kannada e inglés, además de ejemplos de código y conversación.

No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO posteriores al ajuste supervisado. La innovación técnica principal del artefacto publicado es la cuantización GGUF mediante llama.cpp (convert + quantize), que permite ejecutar el modelo en CPU y en GPUs de gama baja con pérdida de calidad mínima en Q4_K_M.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, hindi, tamil, telugu y kannada.
- Generación de código en Python, JavaScript, Bash, SQL y otros lenguajes, según la model card.
- Razonamiento matemático y lógico básico, con resolución paso a paso.
- Soporte declarado de function calling y uso de herramientas (capacidad agéntica).
- Orientación a casos de negocio: atención al cliente, ERP y automatización.
- Compatibilidad con el chat template de Qwen2.5 (ChatML) y con endpoints compatibles con OpenAI vía llama.cpp.
- No se declara soporte de visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Asistente de atención al cliente en lenguas índicas: el modelo puede mantener conversaciones multi-turno en hindi, tamil, telugu o kannada, lo que permite desplegar un chatbot local en centros de soporte regionales sin enviar datos a la nube. Adecuado por su tamaño reducido y su ajuste específico en estas lenguas.
- Despliegue en dispositivos de borde: con 1,8 GB en Q4_K_M, cabe en portátiles de 4 GB de RAM y en dispositivos tipo Raspberry Pi de gama alta, lo que habilita asistentes offline en entornos con conectividad limitada.
- Generación de código en entornos de desarrollo locales: puede integrarse en editores o scripts CLI mediante llama-cpp-python para autocompletar y explicar fragmentos en Python, JavaScript o SQL, sin depender de APIs externas.
- Automatización de procesos empresariales (ERP): el soporte declarado de function calling permite conectar el modelo a herramientas internas para consultar inventario, generar informes o clasificar tickets en inglés e hindi.
- Traducción y adaptación de contenidos entre inglés y lenguas del sur de la India: útil para localizar documentación, correos o materiales de formación manteniendo el tono conversacional.
- Prototipado rápido de asistentes conversacionales: la disponibilidad de GGUF y de un Modelfile de Ollama listo para usar reduce el tiempo de puesta en marcha a minutos, lo que lo hace idóneo para pruebas de concepto y demos.
- Educación y tutoría básica: puede explicar conceptos paso a paso en varias lenguas, aunque con las limitaciones propias de un modelo de 3B en razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: 1,8 GB para Q4_K_M (ejecutable con 4 GB de RAM según la model card) y 5,8 GB para BF16 (recomendado 8 GB o más).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM para Q4_K_M (GTX 1650, RTX 3050, RTX 4060); para BF16 se recomienda RTX 3060 12 GB o superior. En entornos de servidor, A100 o H100 no son necesarias por el tamaño del modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs consumer recientes con 4 GB o más de VRAM.
- Opciones de despliegue: llama.cpp (llama-cli), Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. No se menciona soporte explícito de vLLM o TGI para este artefacto.
- Latencia y throughput: no disponibles en la información proporcionada. La model card sugiere n_threads=8 y n_ctx=1024 en los ejemplos, lo que indica un uso orientado a CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas índicos | Licencia | Formato |
|---|---|---|---|---|---|
| Agni Lite 3B v1 GGUF | 3,09 B | no disponible (backbone 32k) | hi, ta, te, kn | agni-community (propietaria) | GGUF |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 tokens | parcial (no nativo índico) | Apache 2.0 | safetensors, GGUF |
| Llama 3.2 3B Instruct | 3,21 B | 128.000 tokens | limitado | Llama 3.2 Community | safetensors, GGUF |
| Gemma 2 2B IT | 2,61 B | 8.192 tokens | limitado | Gemma Terms | safetensors, GGUF |

La ventaja diferencial de Agni Lite frente a sus alternativas es el ajuste específico en cuatro lenguas índicas, a costa de una licencia propietaria y de un contexto efectivo no documentado. Qwen2.5-3B-Instruct, su modelo base, ofrece licencia Apache 2.0 y contexto de 32k, pero sin especialización índica. Llama 3.2 3B y Gemma 2 2B son alternativas con licencias comunitarias más restrictivas en algunos aspectos y sin foco en lenguas del sur de la India.

## Limitaciones y advertencias

- Modelo de 3B parámetros: puede fallar en razonamiento multi-paso complejo y en tareas que requieran planificación larga.
- La cuantización Q4_K_M introduce una ligera pérdida de calidad frente a BF16.
- El propio autor reconoce que la calidad en lenguas índicas aún está en mejora y que el inglés es actualmente más fuerte.
- Riesgo de alucinación y de generar información fabricada; no debe usarse como sustituto de asesoramiento médico, legal o financiero.
- Licencia agni-community propietaria: es imprescindible revisar LICENSE-AGNI-COMMUNITY.md antes de cualquier uso comercial, ya que las condiciones no son equivalentes a Apache 2.0 ni MIT.
- El contexto efectivo del ajuste no está documentado; los ejemplos de la model card usan n_ctx=1024, muy por debajo del máximo del backbone, lo que sugiere que el ajuste podría no haber explotado ventanas largas.
- No se han publicado benchmarks, por lo que las afirmaciones de capacidad no están respaldadas por evaluaciones independientes.
- El repositorio tiene 193 descargas y 0 likes, lo que indica una adopción muy limitada y ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo GGUF en HuggingFace: https://huggingface.co/laabamone/laabam-ai-3b-v1-gguf
- Modelo completo (safetensors): https://huggingface.co/laabamone/laabam-ai-3b-v1
- Adaptador LoRA: https://huggingface.co/laabamone/laabam-ai-3b-v1-lora
- Licencia Agni Community: https://huggingface.co/laabamone/laabam-ai-3b-v1-gguf/blob/main/LICENSE-AGNI-COMMUNITY.md
- Sitio web del desarrollador: https://www.laabamone.com/
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Contacto: mailto:support@laabamone.com
