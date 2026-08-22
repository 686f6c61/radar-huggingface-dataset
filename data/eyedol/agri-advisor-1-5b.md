# EYEDOL/agri-advisor-1.5b

## Resumen

agri-advisor-1.5b es un ajuste fino (fine-tune) del modelo Qwen/Qwen2.5-1.5B-Instruct, desarrollado por EYEDOL, orientado a actuar como asistente de asesoramiento agrícola offline. El modelo cubre diagnóstico de cultivos, cálculos de fertilizantes y precios de mercado, y guías sobre plagas, pensado para pequeños agricultores y oficiales de extensión en entornos con conectividad limitada o nula.

La relevancia del modelo reside en su formato GGUF cuantizado, que permite ejecutarlo en CPU mediante llama.cpp sin necesidad de infraestructura cloud ni conexión a internet. Con aproximadamente 1.54 mil millones de parámetros, se posiciona como una solución ligera y desplegable en dispositivos de bajo coste, algo crítico en zonas rurales. El modelo base Qwen2.5-1.5B-Instruct aporta una arquitectura transformer decoder-only y una ventana de contexto de hasta 32K tokens, aunque no se confirma si el fine-tune conserva íntegramente dicha longitud.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-1.5B-Instruct) |
| Parametros totales | 1.543.704.304 (1.54B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2.5-1.5B-Instruct soporta 32K tokens) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M (formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct, un transformer autoregresivo con atención de escala logarítmica y mecanismos de atención por ventana deslizante, diseñado para instrucciones y diálogo. El fine-tune se realizó sobre datos específicos del dominio agrícola (diagnóstico de enfermedades, recomendaciones de fertilización, orientación sobre plagas y cálculos de mercado), aunque no se publican detalles sobre el dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas como RLHF o DPO. El resultado se convirtió a formato GGUF y se cuantizó a Q4_K_M y Q5_K_M para optimizar su ejecución en CPU, reduciendo el pico de memoria RAM.

## Capacidades

- Generación de texto conversacional: responde a preguntas y proporciona recomendaciones en lenguaje natural.
- Diagnóstico de cultivos: identifica posibles enfermedades o problemas a partir de descripciones textuales del usuario.
- Cálculos agrícolas: estima dosis de fertilizantes, costes de producción y análisis de rentabilidad.
- Guía de plagas: ofrece información sobre plagas comunes y métodos de control.
- Soporte de tool calling: no confirmado, aunque el modelo base Qwen2.5-1.5B-Instruct soporta function calling; no hay evidencia de que el fine-tune lo mantenga.
- Capacidades multilingües: no confirmadas; el modelo base soporta múltiples idiomas, pero el fine-tune no especifica idiomas.
- Operación offline: optimizado para inferencia sin conexión mediante llama.cpp.

## Casos de uso

- **Diagnóstico de enfermedades en campo**: un agricultor describe síntomas de sus cultivos (manchas, decoloración) y el modelo sugiere posibles causas y tratamientos, basándose en el conocimiento agrícola incorporado durante el fine-tune. Adecuado por su capacidad de generar respuestas contextualizadas sin conexión.
- **Recomendación de fertilización**: el asistente calcula dosis de nitrógeno, fósforo y potasio según el tipo de cultivo y el estado del suelo, ayudando a optimizar recursos y reducir costes. Su tamaño reducido permite ejecutarlo en dispositivos móviles o portátiles de gama baja.
- **Planificación de ventas y mercados**: el modelo ayuda a estimar precios de venta, márgenes y puntos de equilibrio a partir de datos de costes y rendimiento esperado, útil para cooperativas agrícolas que operan sin conexión.
- **Apoyo a oficiales de extensión**: los agentes de extensión pueden consultar al modelo en zonas remotas para obtener recomendaciones estandarizadas y consistentes, mejorando la cobertura de servicios agrícolas.
- **Integración en aplicaciones móviles offline**: el formato GGUF permite embeber el modelo en apps Android/iOS usando llama.cpp, ofreciendo asesoramiento sin depender de la red, ideal para regiones con baja cobertura.
- **Formación de pequeños agricultores**: el modelo puede generar explicaciones sencillas sobre prácticas agrícolas, interpretación de síntomas y buenas prácticas de cultivo, funcionando como tutor virtual en talleres de formación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no incluye métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) en su ficha de HuggingFace ni en los repositorios asociados. No es posible comparar su rendimiento cuantitativo con otros modelos sin datos adicionales.

## Requisitos de hardware

- **RAM estimada**: el archivo `agri-Q4_K_M.gguf` ocupa aproximadamente 1.5 GB en disco, y el `agri-Q5_K_M.gguf` alrededor de 2 GB. La RAM pico durante inferencia será ligeramente superior (por ejemplo, ~2 GB para Q4_K_M y ~2.5 GB para Q5_K_M).
- **GPU**: no necesaria; el modelo está diseñado para CPU mediante llama.cpp. Puede ejecutarse en procesadores x86_64 y ARM (Raspberry Pi 4/5 con 4GB RAM es viable en Q4_K_M).
- **GPUs compatibles**: aunque no se requiere, si se desea aceleración, puede usarse en GPU con CUDA o Metal a través de llama.cpp (sin cuantización de GPU específica, pero sí con offloading).
- **Opciones de despliegue**: llama.cpp (recomendado), llama-cpp-python, Ollama (si se convierte a formato compatible), y servidores TGI o vLLM con soporte GGUF (aunque estos suelen requerir GPU).
- **Latencia y throughput**: no se dispone de mediciones oficiales. En una CPU moderna (ej. 8 núcleos), la generación de tokens típica para un modelo 1.5B cuantizado suele estar entre 10-30 tokens/segundo, dependiendo de la longitud de la secuencia y del hardware.

## Comparativa con modelos similares

No se dispone de datos concretos de los modelos comparables (tamaño, contexto, rendimiento) más allá de sus nombres. Se listan alternativas de la misma categoría (fine-tunes agrícolas sobre Qwen2.5-1.5B) sin poder verificar sus especificaciones:

| Modelo | Base | Params | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EYEDOL/agri-advisor-1.5b (este) | Qwen2.5-1.5B-Instruct | 1.54B | no disponible | Apache 2.0 | GGUF |
| iamsamuelk/adtc-2026-agri-advisor-qwen1.5b-persona | Qwen2.5-1.5B-Instruct | no disponible | no disponible | no disponible | no disponible |
| EYEDOL/adtc-agri-sft-qwen2.5-1.5b-v2 | Qwen2.5-1.5B-Instruct | no disponible | no disponible | no disponible | API FriendliAI |

No se puede establecer una comparativa cuantitativa fiable sin especificaciones publicadas de los modelos alternativos.

## Limitaciones y advertencias

- **Sin datos de entrenamiento**: no se ha publicado información sobre el dataset utilizado en el fine-tune, lo que impide evaluar la cobertura de cultivos, regiones geográficas o idiomas, y el riesgo de sesgos.
- **Riesgo de alucinación**: al ser un modelo de 1.5B, puede generar respuestas plausibles pero incorrectas en dominios no cubiertos por el entrenamiento; no debe usarse para decisiones de alto impacto sin verificación humana.
- **Idiomas**: no se especifica qué idiomas soporta el fine-tune; el modelo base Qwen2.5-1.5B-Instruct es multilingüe, pero no se confirma si el ajuste agrícola conserva esa capacidad.
- **Contexto**: aunque el base tiene 32K tokens, no se garantiza que el fine-tune preserve esa longitud; en la práctica, con GGUF cuantizado y CPU, el contexto útil puede reducirse por limitaciones de memoria.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías de exactitud agrícola; los usuarios son responsables de validar las recomendaciones.
- **Producción**: sin benchmarks ni pruebas de robustez, el modelo debe considerarse experimental; se recomienda evaluación en campo antes de un despliegue masivo.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/EYEDOL/agri-advisor-1.5b)
- [Modelo base Qwen/Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [Modelo similar: iamsamuelk/adtc-2026-agri-advisor-qwen1.5b-persona](https://huggingface.co/iamsamuelk/adtc-2026-agri-advisor-qwen1.5b-persona)
- [Plataforma web Agri-Advisor AI](https://www.agri-advisor.ai/)
- [Repositorio GitHub agri-advisory (detección de cultivos)](https://github.com/Shubhu1243/agri-advisory)
- [Repositorio GitHub agri_advisory_AI (sistema local multiagente)](https://github.com/ruilibuaa/agri_advisory_AI)
- [Despliegue en FriendliAI (modelo variante)](https://friendli.ai/models/EYEDIA/adtc-agri-sft-qwen2.5-1.5b-v2)
