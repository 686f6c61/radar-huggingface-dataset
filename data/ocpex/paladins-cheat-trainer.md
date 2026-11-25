# OCPEX/paladins-cheat-trainer

## Resumen

El repositorio `OCPEX/paladins-cheat-trainer` no contiene un modelo de inteligencia artificial. Se trata de un artefacto publicado en Hugging Face que se presenta como un supuesto "cheat trainer" para el videojuego Paladins, distribuido como archivo ejecutable para Windows 10/11 de 64 bits. La model card describe un paquete ZIP de 4,8 MB con un binario `.exe` protegido por contraseña, sin pesos, sin arquitectura de red neuronal ni pipeline de inferencia asociado.

No existe información sobre arquitectura, parámetros, contexto, cuantización ni datos de entrenamiento, porque el objeto publicado no es un modelo de lenguaje ni multimodal. Los metadatos de Hugging Face confirman un pipeline "no disponible", cero descargas y cero valoraciones en el momento de la consulta, con licencia MIT declarada y una lista de idiomas que coincide con la de una aplicación de escritorio, no con la de un modelo entrenado.

Desde la perspectiva de un editor técnico de IA open source, esta ficha debe leerse como una advertencia: el contenido de la model card incluye enlaces a binarios alojados en repositorios de GitHub de terceros, instrucciones para ejecutar un ejecutable "como administrador" y contraseñas de descompresión. Nada de ello constituye un modelo evaluable, y su distribución plantea riesgos de seguridad evidentes. La ficha se completa a continuación con los campos obligatorios, indicando "no disponible" donde no hay dato técnico verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de IA; es un supuesto ejecutable de Windows) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, ru, zh, es, pt, tr, de, fr, ja, ko, ar, pl, vi, id (según metadatos del repositorio) |
| Licencia | MIT |
| Formato de pesos | no disponible (el artefacto distribuido es un ZIP con un `.exe` de Windows x64) |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal que describir. El artefacto declarado es un ejecutable portable para Windows 10/11 x64, empaquetado en `inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip` (4,8 MB) y protegido con la contraseña `2026`. La model card menciona componentes propios de un software de trampas para videojuegos (overlay externo a 144 Hz, ESP con cajas 2D/3D y esqueletos, radar 2D, filtro de loot, suavizado de entrada Bézier, capa de render "stream-proof" y tecla de pánico `END`), no de un sistema entrenado con datos.

No se documenta ningún proceso de entrenamiento, dataset, número de tokens, RLHF, DPO ni innovación algorítmica. Tampoco se aportan hashes verificables del binario ni firmas de código. La única información "técnica" son tiempos de respuesta declarados (por ejemplo, "< 6 ms" para el overlay o "< 9 ms" para la descarga de la tecla de pánico) que no son medibles ni auditables sin el binario.

## Capacidades

- No es un modelo generativo: no produce texto, código, matemáticas ni contenido multimodal.
- No soporta tool calling ni function calling en el sentido de una API de modelo.
- No implementa razonamiento multi-paso ni comportamiento de agente.
- No tiene capacidades multilingües derivadas de entrenamiento; los idiomas listados son metadatos de la ficha.
- El artefacto declarado, según su propia model card, ofrece funciones de trampa para un videojuego: overlay, ESP, radar 2D, filtro de loot y perfiles JSON conmutables.
- No se proporciona API, servidor de inferencia, tokenizador ni plantilla de chat.

## Casos de uso

- Ninguno relacionado con IA: el artefacto no permite generación de texto, código, análisis de datos ni razonamiento.
- Auditoría de seguridad: un equipo puede usar esta ficha para identificar y bloquear la distribución de binarios no verificados etiquetados como modelos en plataformas de ML.
- Formación en higiene de cadena de suministro: sirve como ejemplo de model card que imita metadatos de Hugging Face para distribuir ejecutables.
- Monitorización de repositorios: los equipos de plataforma pueden detectar patrones como contraseñas de descompresión, enlaces a releases de terceros y ausencia de pipeline.
- Investigación sobre contaminación de hubs: útil para estudiar cómo se infiltran artefactos ajenos a la IA en catálogos de modelos.
- Concienciación de usuarios finales: ilustra por qué no debe ejecutarse un `.exe` descargado de un repositorio de modelos "como administrador".
- No procede ningún caso de uso de inferencia, despliegue o integración en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen métricas de MMLU, HumanEval, GSM8K ni de ninguna otra tarea de IA, porque el artefacto no es un modelo evaluable. Los únicos números de la model card son tiempos de respuesta declarados por el autor para funciones de software (overlay, radar, tecla de pánico), no verificables de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; no hay pesos ni grafo computacional.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: no aplica.
- Plataforma declarada por el autor: Windows 10/11 de 64 bits, ejecución "como administrador".
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponibles; los tiempos citados en la model card (< 6 ms, < 9 ms, < 15 ms) son afirmaciones del autor sin metodología.
- Almacenamiento: el paquete declarado ocupa 4,8 MB.

## Comparativa con modelos similares

No disponible. No existe una categoría de "modelos" comparable, ya que el artefacto no es un modelo de IA. Frente a modelos reales de la misma plataforma (por ejemplo, un LLM de 7B con licencia Apache 2.0 o un modelo multimodal con pesos safetensors), las diferencias son categóricas: aquí no hay parámetros, contexto, benchmarks ni pesos. La siguiente tabla resume la ausencia de comparabilidad.

| Criterio | OCPEX/paladins-cheat-trainer | Modelo de IA típico en Hugging Face |
|---|---|---|
| Parámetros | no disponible | millones a cientos de miles de millones |
| Contexto | no disponible | miles a millones de tokens |
| Pesos | no (ZIP con `.exe`) | safetensors, GGUF, etc. |
| Pipeline | no disponible | text-generation, image-text-to-text, etc. |
| Benchmarks | ninguno | MMLU, HumanEval, GSM8K, etc. |
| Evaluabilidad | nula | reproducible con harness estándar |

## Limitaciones y advertencias

- No es un modelo de IA: carece de pesos, arquitectura y pipeline; cualquier uso como modelo es inviable.
- Riesgo de seguridad alto: la model card invita a descargar un `.exe` de un repositorio de GitHub de terceros, ejecutarlo como administrador y descomprimirlo con una contraseña fija (`2026`), un patrón habitual en campañas de malware.
- Inconsistencia de nombres: el paquete se llama `inzoi-cheat-trainer-mod-menu-...` mientras el repositorio se llama `paladins-cheat-trainer`, lo que sugiere reutilización de plantillas o suplantación.
- Contenido potencialmente fraudulento: promete funciones de trampa en un juego en línea, lo que puede violar los términos de servicio del videojuego y la legislación aplicable.
- Sin verificación de integridad: no se publican hashes, firmas ni auditorías del binario.
- Licencia MIT declarada, pero sin código fuente ni pesos a los que aplicarla de forma verificable.
- Idiomas listados sin respaldo técnico: son metadatos de la ficha, no capacidades medidas.
- Cero descargas y cero valoraciones en el momento de la consulta: no hay evidencia de uso legítimo ni de comunidad.
- No debe desplegarse en producción, ni ejecutarse en entornos corporativos, ni citarse como modelo en documentación técnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/OCPEX/paladins-cheat-trainer
- Release de GitHub citada en la model card (no verificar ni ejecutar): https://github.com/Roussel10024/inzoi-cheat-trainer-mod-menu/releases/download/v1.2.0/inzoi-cheat-trainer-mod-menu-v1.2.2-win64.zip
- Repositorio de GitHub citado en la model card: https://github.com/diane7022/paladins-cheat-trainer
- Paper, blog, demo o documentación técnica: no disponible
