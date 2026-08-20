# alwoolley/Phi-4-mini-instruct

## Resumen

Phi-4-mini-instruct es un modelo de lenguaje ligero de 3.8 mil millones de parámetros desarrollado por Microsoft dentro de la familia Phi-4. Está diseñado para entornos con restricciones de memoria y cómputo, así como para escenarios sensibles a la latencia, ofreciendo un equilibrio entre eficiencia y capacidades de razonamiento, especialmente en matemáticas y lógica. El modelo se entrenó sobre una combinación de datos sintéticos y sitios web públicos filtrados, con un enfoque en datos densos en razonamiento, y posteriormente se refinó mediante supervisión (SFT) y optimización directa de preferencias (DPO) para mejorar la adherencia a instrucciones y la seguridad.

Con una ventana de contexto de 128.000 tokens, soporte multilingüe (más de 20 idiomas) y capacidad de function calling, este modelo se posiciona como una opción atractiva para aplicaciones de producción que requieren un LLM compacto pero capaz. Su licencia MIT permite uso comercial sin restricciones significativas, y su formato de pesos safetensors facilita su integración en pipelines de transformers. La versión alojada en el repositorio `alwoolley/Phi-4-mini-instruct` es un espejo del modelo oficial de Microsoft, con los mismos pesos y configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only) |
| Parametros totales | 3.836.021.760 (3,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No especificados en la informacion disponible (pesos en safetensors, cuantizables a FP16, INT8, INT4 mediante herramientas externas) |
| Idiomas soportados | Multilingue: arabe, chino, checo, danes, neerlandes, ingles, fines, frances, aleman, hebreo, hungaro, italiano, japones, coreano, noruego, polaco, portugues, ruso, espanol, sueco, tailandes, turco, ucraniano |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Phi-4-mini-instruct es un modelo transformer denso de tipo decoder-only, perteneciente a la familia Phi-4. Aunque la informacion disponible no detalla la configuracion interna (numero de capas, dimensiones de atencion, etc.), se sabe que emplea una arquitectura optimizada para eficiencia y un vocabulario ampliado para mejorar el soporte multilingue. El entrenamiento se realizo sobre una mezcla de datos sinteticos de alta calidad y sitios web publicos filtrados, priorizando contenido denso en razonamiento. El proceso de post-entrenamiento incluyo supervisión fina (SFT) y optimizacion directa de preferencias (DPO), lo que permitio mejorar la adherencia a instrucciones, la capacidad de function calling y las medidas de seguridad. No se han publicado datos sobre el numero total de tokens de entrenamiento ni sobre la composicion exacta del dataset.

## Capacidades

- Generacion de texto y conversacion multi-turno con adherencia precisa a instrucciones.
- Razonamiento fuerte en matematicas y logica, destacando en benchmarks como BigBench Hard y MMLU-Pro.
- Soporte de function calling / tool calling, permitiendo integracion con APIs y herramientas externas.
- Ventana de contexto de 128K tokens, adecuada para documentos largos, analisis de codigo extenso o conversaciones prolongadas.
- Multilingue: cubre 23 idiomas, con rendimiento variable segun el idioma (no evaluado uniformemente).
- Optimizado para entornos con restricciones de memoria y latencia, gracias a su tamano compacto de 3,8B parametros.
- No incluye capacidades de vision ni audio; es exclusivamente texto.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 128K tokens) y soporta function calling para consultar bases de datos de pedidos o sistemas CRM, reduciendo la necesidad de intervencion humana.
- Generacion de codigo en produccion: con soporte de tool calling, puede integrarse en pipelines de CI/CD para autocompletar funciones, generar tests unitarios o documentar APIs, manteniendo baja latencia en entornos con GPUs modestas.
- Analisis de documentos legales o financieros: su ventana de 128K tokens permite procesar contratos extensos o informes anuales completos en una sola pasada, extrayendo clausulas relevantes o resumiendo riesgos.
- Asistente de razonamiento matematico para educacion: el modelo destaca en problemas de logica y matematicas, por lo que puede usarse en plataformas de tutoria para explicar pasos de resolucion o generar ejercicios personalizados.
- Chatbot multilingue para soporte global: al cubrir 23 idiomas, puede desplegarse como agente conversacional en empresas con clientes internacionales, aunque se recomienda validar el rendimiento en cada idioma especifico.
- Automatizacion de tareas de back-office: con function calling, puede interactuar con APIs de correo, calendarios o ERPs para programar reuniones, clasificar tickets o generar informes, ejecutandose en hardware de bajo coste.

## Benchmarks y rendimiento

La model card oficial de Microsoft proporciona una tabla comparativa parcial (extraida de su plataforma interna de benchmarks). Los datos disponibles son los siguientes:

| Benchmark | Phi-4 mini-Ins | Phi-3.5-mini-Ins | Llama-3.2-3B-Ins | Mistral-3B | Qwen2.5-3B-Ins | Qwen2.5-7B-Ins | Mistral-8B-2410 | Llama-3.1-8B-Ins | Llama-3.1-Tulu-3-8B | Gemma2-9B-Ins | GPT-4o-mini-2024-07-18 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Arena Hard | 32,8 | 34,4 | 17,0 | 26,9 | 32,0 | 55,5 | 37,3 | 25,7 | 42,7 | 43,7 | 53,7 |
| BigBench Hard (0-shot, CoT) | 70,4 | 63,1 | 55,4 | 51,2 | 56,2 | 72,4 | 53,3 | 63,4 | 55,5 | 65,7 | 80,4 |
| MMLU (5-shot) | 67,3 | 65,5 | 61,8 | 60,8 | 65,0 | 72,6 | 63,0 | 68,1 | 65,0 | 71,3 | 77,2 |
| MMLU-Pro (0-shot, CoT) | 52,8 | 47,4 | 39,2 | 35,3 | 44,7 | 56,2 | 36,6 | 44,0 | 40,9 | 50,1 | 62,8 |

Nota: la tabla original se corta en la fila de "Reasoning", por lo que no se dispone de mas datos. Estos resultados indican que Phi-4-mini-instruct supera a modelos de tamano similar en razonamiento (BigBench Hard, MMLU-Pro) y compite bien en MMLU, aunque queda por detras de modelos de 7B-9B en algunos benchmarks agregados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,8B parametros en FP16, se necesitan aproximadamente 7,7 GB de VRAM (el tamano del repo es 7,7 GB). Con cuantizacion INT8, ~4 GB; con INT4, ~2 GB.
- GPU recomendadas: cabe en GPUs consumer como RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) sin problemas. Para despliegue en servidor, una A10G o L4 es suficiente.
- En consumer GPU: si, es perfectamente viable en GPUs de 8 GB o mas con cuantizacion ligera.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, TGI (text-generation-inference) y transformers nativo. El repositorio indica compatibilidad con endpoints de HuggingFace.
- Latencia y throughput: no se han publicado datos oficiales. Con 3,8B parametros, se espera una generacion de 20-40 tokens/segundo en una RTX 4090 con cuantizacion FP16, y mayor con cuantizaciones inferiores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | MMLU (5-shot) | BigBench Hard (0-shot, CoT) | Arena Hard |
|---|---|---|---|---|---|---|
| Phi-4-mini-instruct | 3,8B | 128K | MIT | 67,3 | 70,4 | 32,8 |
| Phi-3.5-mini-instruct | 3,8B | 128K | MIT | 65,5 | 63,1 | 34,4 |
| Llama-3.2-3B-instruct | 3,2B | 128K | Llama 3.2 Community | 61,8 | 55,4 | 17,0 |
| Qwen2.5-3B-instruct | 3,1B | 32K (ampliable a 128K) | Apache 2.0 | 65,0 | 56,2 | 32,0 |
| Mistral-3B (Mistral Small 3) | 3,1B | 32K | Apache 2.0 | 60,8 | 51,2 | 26,9 |

Phi-4-mini-instruct destaca frente a sus competidores directos de 3B en razonamiento (BigBench Hard, MMLU-Pro) y ofrece una ventana de contexto de 128K, superior a la de Qwen2.5-3B y Mistral-3B. Su licencia MIT es mas permisiva que la de Llama-3.2 (que tiene restricciones de uso comercial para empresas con mas de 700M de usuarios mensuales). En comparacion con modelos de 7B-9B, pierde en rendimiento bruto pero gana en eficiencia y coste de despliegue.

## Limitaciones y advertencias

- Sesgos conocidos: como todo LLM entrenado con datos web, puede reflejar sesgos presentes en el corpus de entrenamiento. La model card no detalla evaluaciones especificas de sesgo.
- Riesgo de alucinacion: no se han publicado tasas de alucinacion especificas. Se recomienda validar las salidas en aplicaciones de alto riesgo.
- Rendimiento multilingue desigual: aunque soporta 23 idiomas, el rendimiento no esta evaluado uniformemente; es probable que el ingles y los idiomas con mas datos tengan mejor calidad que otros.
- Limitaciones de contexto: aunque la ventana es de 128K, el rendimiento en contextos muy largos puede degradarse; se recomienda probar con datos propios.
- Restricciones de licencia: la licencia MIT permite uso comercial sin restricciones, pero la model card advierte que los desarrolladores deben cumplir las leyes aplicables (privacidad, comercio, etc.) y evaluar la seguridad y equidad para cada caso de uso.
- No apto para tareas de vision o audio: es un modelo de texto puro.
- La version alojada en `alwoolley/Phi-4-mini-instruct` es un espejo no oficial; se recomienda usar el repositorio oficial de Microsoft para produccion.

## Enlaces

- Repositorio HuggingFace (espejo): https://huggingface.co/alwoolley/Phi-4-mini-instruct
- Repositorio oficial: https://huggingface.co/microsoft/Phi-4-mini-instruct
- Blog de Microsoft sobre Phi-4-mini: https://aka.ms/phi4-feb2025
- Informe tecnico: https://aka.ms/phi-4-multimodal/techreport
- Paper (arXiv 2503.01743): https://huggingface.co/papers/2503.01743
- Phi Cookbook (ejemplos): https://github.com/microsoft/PhiCookBook
- Portal Phi de Azure: https://azure.microsoft.com/en-us/products/phi
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/microsoft/phi-4-mini
- Catalogo de modelos Azure AI: https://ai.azure.com/catalog/models/Phi-4-mini-instruct
