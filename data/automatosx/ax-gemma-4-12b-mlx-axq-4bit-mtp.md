# AutomatosX/AX-gemma-4-12b-MLX-AXQ-4bit-MTP

## Resumen

AX-gemma-4-12b-MLX-AXQ-4bit-MTP es una cuantización de 4 bits del modelo instructivo de Google Gemma 4 12B, desarrollada por AutomatosX y publicada en HuggingFace. Utiliza el formato MLX, lo que la hace específica para Apple Silicon, y aplica la técnica AXQ (AXQuant) de precisión mixta para reducir el tamaño del modelo manteniendo una alta fidelidad con respecto al original. El repositorio incluye además un drafter MTP (Multi-Token Prediction) que permite acelerar la decodificación especulativa en entornos que lo soporten.

El modelo está diseñado para ejecutarse en Macs con chips M-series, ofreciendo una alternativa eficiente en memoria y velocidad para tareas de generación de texto, razonamiento y código. La cuantización AXQ consigue un tamaño de aproximadamente 14.9 GB, con una retención de calidad general de 1.0000 y de 1.0325 en tareas de coding, según la certificación Tier 1 del autor. Aunque el paquete declara la presencia de componentes de visión, esta modalidad no está certificada y su funcionamiento no está garantizado.

Relevante para desarrolladores que trabajan en ecosistema Apple y necesitan un modelo de 12B con bajo consumo de memoria y buena calidad, con la posibilidad de activar la decodificación especulativa mediante el drafter MTP incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Gemma 4, decoder-only) |
| Parametros totales | 12B (modelo base google/gemma-4-12b-it) |
| Parametros activos | no aplica (no es MoE) |
| Parametros en safetensors cuantizados | 1.996.095.280 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | AXQ 4-bit (precision mixta) |
| Idiomas soportados | no disponible |
| Licencia | Gemma (licencia de Google) |
| Formato de pesos | safetensors (MLX), JSON de configuracion |

## Arquitectura y entrenamiento

El modelo es una cuantizacion del checkpoint `google/gemma-4-12b-it`, no un entrenamiento desde cero. La arquitectura subyacente es la de Gemma 4, un transformer decoder-only con atencion por ventanas deslizantes y atencion global alternada, disenado para manejar contextos largos. La cuantizacion AXQ aplica precision mixta: asigna diferentes niveles de bits a distintas capas y tensores segun su sensibilidad, logrando un tamaño efectivo de 4.9 bits por peso (BPW) en lugar de 4 bits uniformes, con una relacion de tamaño de 0.6667× respecto a una cuantizacion uniforme equivalente.

El paquete incluye un drafter MTP (`assistant/`) que implementa decodificacion especulativa de multiples tokens. Este drafter no esta certificado (Tier 2) y requiere activacion explicita mediante variables de entorno (`AX_MLX_GEMMA4_ASSISTANT_MTP=1`). No se proporcionan datos sobre el dataset de entrenamiento ni sobre tecnicas de alineacion (RLHF/DPO), ya que el modelo base ya las incorpora.

## Capacidades

- Generacion de texto en ingles y otros idiomas (segun el modelo base, aunque no se especifican idiomas concretos).
- Razonamiento logico y matematico, herencia de Gemma 4 12B.
- Generacion de codigo en multiples lenguajes de programacion.
- Soporte de tool calling y function calling (depende del modelo base, no confirmado en esta variante).
- Capacidades de agente y razonamiento multi-paso, sujetas a la ventana de contexto del modelo base.
- Decodificacion especulativa mediante drafter MTP (requiere activacion manual y no esta certificada).
- Vision multimodal declarada como "present-not-certified": el paquete incluye un sidecar `vision.safetensors`, pero no se garantiza su funcionamiento en MLX-VLM.
- Sin soporte de audio (no hay torres de audio ni pesos de sidecar).

## Casos de uso

- Asistente de codigo en local para macOS: el modelo puede integrarse en editores o IDEs mediante herramientas como Ollama o llama.cpp (si se convierte a GGUF) para autocompletado y generacion de funciones, aprovechando su capacidad de razonamiento y su tamano reducido.
- Chatbot de soporte tecnico interno: con su capacidad de mantener conversaciones multi-turno y su licencia permisiva (con restricciones), puede desplegarse en intranets para responder preguntas frecuentes, redactar correos y resumir documentacion.
- Analisis de documentos largos: si el contexto del modelo base lo permite, puede procesar informes, articulos o contratos para extraer informacion clave, resumir secciones o responder preguntas especificas.
- Generacion de pruebas unitarias: el modelo puede crear casos de prueba a partir de fragmentos de codigo, ayudando en pipelines de CI/CD cuando se integra via API o scripts locales.
- Prototipado rapido de aplicaciones de texto: al ejecutarse en Apple Silicon con MLX, permite iterar rapidamente en demos de generacion de texto, clasificacion o extraccion de informacion sin depender de servicios en la nube.
- Investigacion en eficiencia de modelos: la cuantizacion AXQ y el drafter MTP son casos de estudio para desarrolladores que exploran tecnicas de compresion y aceleracion en hardware Apple.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La certificacion Tier 1 del autor reporta metricas de retencion de calidad relativas al modelo base:

| Metrica | Valor |
|---|---|
| Retencion de calidad general | 1.0000 |
| Retencion de calidad en coding | 1.0325 |
| Tamano relativo vs uniforme | 0.6667× |
| BPW medido | 4.9001 |

Estos valores indican que la cuantizacion mantiene la calidad del modelo original, pero no son comparables con benchmarks publicos.

## Requisitos de hardware

- Disenado para Apple Silicon (chips M1, M2, M3, M4 y M5) gracias al formato MLX.
- Tamano del repositorio: 14.9 GB, lo que sugiere un uso de memoria de al menos 16 GB para cargar el modelo en RAM unificada. Se recomienda un Mac con 32 GB o mas para dejar margen al sistema y a la generacion.
- El drafter MTP anade un overhead de memoria adicional (pesos del drafter), aunque no se especifica su tamano exacto.
- No se requiere GPU dedicada; el modelo se ejecuta en la GPU integrada de los chips Apple.
- Opciones de despliegue: MLX (nativo), conversion a GGUF para usar con llama.cpp o Ollama, o uso via librerias de Python como `mlx-lm`.
- La latencia y el throughput dependen del chip y de la activacion del MTP. No se proporcionan cifras concretas.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos cuantizados de la misma categoria en la informacion proporcionada. Como referencia, el modelo base Gemma 4 12B se puede comparar con otros modelos de 12-13B como Llama 3.2 12B o Mistral 12B, pero no hay resultados de benchmarks para esta variante cuantizada.

## Limitaciones y advertencias

- La licencia Gemma de Google impone restricciones de uso: prohibido uso militar, vigilancia masiva, y requiere mantener el aviso de derechos de autor en redistribuciones. Es compatible con uso comercial bajo condiciones.
- La modalidad de vision no esta certificada y puede fallar en MLX-VLM debido a incompatibilidades de layout; no se debe confiar en ella para produccion.
- El drafter MTP no esta certificado (Tier 2) y su activacion puede no producir aceleracion real en todos los entornos; se recomienda probar antes de usarlo en produccion.
- No se especifica la longitud de contexto soportada; se asume la del modelo base, pero no esta confirmada en esta variante.
- Al ser una cuantizacion de 4 bits, puede haber una ligera degradacion en tareas muy sensibles a la precision numerica (por ejemplo, matematicas complejas), aunque la retencion reportada es alta.
- No se proporcionan datos sobre sesgos o alucinaciones especificos; se heredan los del modelo base Gemma 4.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/AutomatosX/AX-gemma-4-12b-MLX-AXQ-4bit-MTP
- Certificado Tier 1 (GitHub): https://github.com/defai-digital/axquant/blob/main/docs/certifications/gemma4-12b-axq4-tier1.md
- Modelo base: https://huggingface.co/google/gemma-4-12b-it
