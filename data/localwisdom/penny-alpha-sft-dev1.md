# LocalWisdom/Penny-Alpha-SFT-dev1

## Resumen

Penny-Alpha-SFT-dev1 es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por LocalWisdom (autor: Hanz) y publicado bajo licencia Apache 2.0. Con 58.935.708 parametros totales (0,06B), es un modelo de escala muy reducida, disenado como experimento "from scratch" de la familia Penny. Se inicializa desde un checkpoint base (penny-alpha-base) preentrenado con 1.000 millones de tokens de Ultra-FineWeb-L3 y despues se ajusta para chat con razonamiento sobre conversaciones de Dolci-Think-SFT.

La arquitectura declarada es DeepSeek-V4.1-Flash (clase `DeepseekV41ForCausalLM`), una variante MoE con atencion con sinks y mezclas de hiper-conexion, con una longitud de contexto de 8.192 tokens. El modelo esta orientado a generacion de texto conversacional y razonamiento en ingles, con un formato de chat que incluye un bloque `<think>...</think>` antes de la respuesta.

Su relevancia es principalmente experimental y educativa: demuestra el pipeline completo de preentrenamiento y SFT de un MoE pequeno, pero por su tamano (0,06B) y su estado "dev1" no debe considerarse un modelo de produccion. Es util para estudiar dinamicas de entrenamiento MoE a baja escala y para validar infraestructura de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepSeek-V4.1-Flash (`DeepseekV41ForCausalLM`), mixture-of-experts |
| Parametros totales | 58.935.708 (0,06B) |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16; router bias, attention sinks e hyper-connection mixes en f32) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas mixture-of-experts, etiquetada por el autor como DeepSeek-V4.1-Flash. Incluye componentes propios de las variantes MoE modernas de DeepSeek: router bias, attention sinks e hyper-connection mixes (estos ultimos almacenados en f32 dentro del checkpoint). No se especifica el numero de expertos, el numero de expertos activos por token ni la dimension oculta.

El entrenamiento se realizo en dos etapas. Primero, un preentrenamiento "from scratch" sobre 1.000 millones de tokens de Ultra-FineWeb-L3. Despues, un ajuste supervisado (SFT) de 0,200B tokens sobre `allenai/Dolci-Think-SFT-Clean-v2`, con un pico de learning rate de 0,0003 y schedule coseno, a razon de 131.072 tokens por paso. La perdida de validacion final reportada es 3,9876. No se menciona uso de RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento con modo "thinking": el template de chat inserta un bloque `<think>...</think>` antes de la respuesta.
- Formato de chat estructurado con roles system, user y assistant mediante `chat_template` del tokenizer.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso mas alla del bloque de pensamiento.
- No se documenta capacidad multilingue: solo ingles.
- No se documenta vision, audio ni otras modalidades.

## Casos de uso

- Experimentacion academica con MoE de baja escala: el modelo permite estudiar el comportamiento de un MoE de 0,06B con contexto de 8K en entornos de laboratorio con recursos limitados.
- Validacion de pipelines de entrenamiento: sirve para comprobar de extremo a extremo el flujo de preentrenamiento y SFT (tokenizacion, template de chat, evaluacion de perdida) antes de escalar a modelos mayores.
- Pruebas de formato de chat y modo thinking: util para verificar que un template con `<think>...</think>` se genera y parsea correctamente en herramientas de inferencia.
- Generacion de texto corto en ingles para demos y prototipos internos donde el coste computacional es critico.
- Investigacion sobre destilacion o inicializacion: puede actuar como checkpoint inicial para experimentos de transferencia a arquitecturas mayores.
- Educacion y docencia: ejemplo didactico de un modelo MoE completo con pesos abiertos y ficha de entrenamiento detallada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de 58,9M de parametros, en bf16 ocupa aproximadamente 0,12 GB de pesos; en fp32, unos 0,24 GB. El overhead de activaciones y cache KV con contexto de 8.192 tokens es minimo.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobradamente suficiente; tambien funciona en CPU.
- Cabe en cualquier GPU consumer y en la mayoria de entornos CPU-only.
- Opciones de despliegue: `transformers` con `DeepseekV41ForCausalLM` (requiere version de transformers que soporte esta clase); no se confirma soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Penny-Alpha-SFT-dev1 | 0,06B (MoE) | 8.192 | Apache 2.0 | Hugging Face |
| Modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma familia o escala en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo en estado "dev1": es un checkpoint de desarrollo, no una version estable ni validada para produccion.
- Tamano muy reducido (0,06B): la capacidad de razonamiento, conocimiento factual y coherencia en conversaciones largas sera limitada en comparacion con modelos de mayor escala.
- Entrenado unicamente en ingles; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo elevado de alucinacion y de respuestas incorrectas, especialmente en tareas de conocimiento o matematicas.
- Perdida de validacion final de 3,9876, relativamente alta, lo que sugiere margen de mejora en la calidad del ajuste.
- No se documentan evaluaciones de sesgo, seguridad ni alineacion.
- No se confirma soporte en frameworks de inferencia optimizados (vLLM, llama.cpp, Ollama, TGI), lo que puede limitar su despliegue.
- La licencia Apache 2.0 permite uso comercial, pero el estado experimental y la falta de evaluaciones desaconsejan su uso en produccion sin validacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/LocalWisdom/Penny-Alpha-SFT-dev1
- Dataset de SFT: https://huggingface.co/datasets/allenai/Dolci-Think-SFT-Clean-v2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
