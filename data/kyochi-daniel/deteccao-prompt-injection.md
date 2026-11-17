# kyochi-daniel/deteccao-prompt-injection

## Resumen

`kyochi-daniel/deteccao-prompt-injection` es un clasificador binario de texto en portugués brasileño orientado a la detección de intentos de prompt injection. No es un modelo de lenguaje: es un pipeline clásico de scikit-learn compuesto por vectorización TF-IDF (unigramas y bigramas de palabras) y una regresión logística, con 1.184 características y un umbral fijo de 0,50. El autor lo presenta explícitamente como un estudio independiente de carácter educativo, no como un componente de seguridad listo para producción.

El problema que aborda es relevante: la inyección de prompts es una de las vulnerabilidades más citadas en aplicaciones basadas en LLM (OWASP la recoge en su cheat sheet de prevención). Este modelo sirve como material didáctico para ilustrar el ciclo completo de un clasificador supervisado: generación de corpus sintético, separación por familias, ajuste de vocabulario e IDF solo en entrenamiento, evaluación con particiones cerradas y análisis de falsos positivos y negativos.

Por su naturaleza, el alcance es muy acotado: corpus sintético de 816 textos, licencia MIT, inferencia solo en CPU con la biblioteca estándar de Python y sin endpoint automático en Hugging Face. Los pesos se distribuyen en `model.json` y requieren la implementación incluida en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (unigramas y bigramas de palabras) + regresion logistica |
| Parametros totales | 1.184 caracteristicas (vocabulario TF-IDF); coeficientes de regresion logistica, numero no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; limite de 12.000 caracteres Unicode por entrada |
| Tipos de cuantizacion | no disponible (no aplica; modelo lineal en JSON) |
| Idiomas soportados | portugues (pt), segun la model card |
| Licencia | MIT |
| Formato de pesos | JSON (`model.json`), sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El pipeline aplica normalizacion NFKD, eliminacion de marcas Unicode, conversion a minusculas y tokenizacion con el patron `[a-z0-9_]{2,}`. Sobre esos tokens construye unigramas y bigramas con TF sublinear (`1+ln(contaje)`), IDF suavizado y normalizacion L2, alimentando una regresion logistica con `C=4`, solver `liblinear` y semilla 42. El umbral de decision es fijo en 0,50 y la salida `probability` es el escore sigmoide de la regresion, no una confianza calibrada.

El corpus es sintetico y autoral: 816 textos, con particiones de 512 para entrenamiento, 128 para validacion, 128 para test y 48 para un desafio manual. Las clases estan balanceadas en todas las particiones. Las primeras 768 muestras derivan de 24 familias, cuatro plantillas por familia y ocho temas por plantilla; familias y plantillas quedan integras en una sola particion, mientras que los temas se comparten entre clases. Vocabulario e IDF se ajustan solo en entrenamiento y los hiperparametros se fijaron antes de evaluar, sin seleccion sobre validacion. El entrenamiento se ejecuto con Python 3.12.13 y scikit-learn 1.9.0 en CPU; ajuste y vectorizacion tardaron 0,018 s en la maquina del autor. El SHA-256 del corpus es `cbf542b3397d1495c8b5424e3c8b52de8e01fbf9d17306211b4c0395f1f6f27c`.

## Capacidades

- Clasificacion binaria de texto en dos clases: `benigno` e `injecao`.
- Deteccion de patrones lexicos asociados a intentos de inyeccion (instrucciones de ignorar reglas, revelar prompts, eludir filtros) en portugues.
- Salida de etiqueta y probabilidad (escore sigmoide) con umbral fijo de 0,50.
- Explicabilidad lineal mediante contribuciones de terminos, que reflejan el calculo del modelo, no la intencion del autor del texto.
- Inferencia local sin red, usando solo la biblioteca estandar de Python.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No procesa imagenes, herramientas ni contexto de conversacion: solo texto plano de hasta 12.000 caracteres.

## Casos de uso

- Docencia y formacion en seguridad de LLM: permite mostrar en clase como se construye, evalua y analiza un clasificador de prompt injection, incluyendo el estudio de falsos positivos y negativos con ejemplos concretos.
- Experimentacion con corpus sintetico: sirve de plantilla para que investigadores reproduzcan el flujo de generacion de familias, plantillas y temas, y lo adapten a otros idiomas o dominios.
- Comparacion de baselines: el propio autor incluye una comparacion contra una regex fija, util para ilustrar las limitaciones de las reglas heuristicas frente a un modelo supervisado simple.
- Demostracion interactiva en navegador: la demo de Hugging Face Spaces permite probar entradas en tiempo real sin infraestructura, adecuada para talleres y charlas.
- Analisis de explicabilidad: las contribuciones de terminos permiten discutir por que un texto se clasifica como inyeccion y por que un texto benigno sobre seguridad puede disparar un falso positivo.
- Prototipado de filtros previos en entornos controlados: como capa de señal adicional en un sandbox de pruebas, nunca como control de acceso ni frontera de seguridad.
- Investigacion sobre robustez: el modelo documenta casos de fallo concretos (por ejemplo, una pregunta benigna sobre la expresion "ignore as instrucciones anteriores" con 0,902, y una inyeccion indirecta con 0,248), utiles para estudiar la brecha entre deteccion lexica e intencion.

## Benchmarks y rendimiento

La model card declara una `model-index` sin resultados. Los datos de evaluacion que el autor publica en la tabla de la model card son los siguientes:

| Particion | Metodo | Precision | Recall | F1 | TN / FP / FN / TP |
|---|---|---:|---:|---:|---|
| Validacion | Modelo | 77,8% | 87,5% | 82,4% | 48 / 16 / 8 / 56 |
| Test | Modelo | 70,0% | 87,5% | 77,8% | 40 / 24 / 8 / 56 |
| Test | Regex fija | 33,3% | 37,5% | 35,3% | 16 / 48 / 40 / 24 |
| Desafio | Modelo | 63,6% | 87,5% | 73,7% | 12 / 12 / 3 / 21 |
| Desafio | Regex fija | 35,7% | 20,8% | 26,3% | 15 / 9 / 19 / 5 |

El test cubre solo cuatro familias y las variantes correlacionadas no son observaciones independientes. No hay evaluacion en trafico real ni estimacion robusta de generalizacion.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia se ejecuta en CPU.
- GPU recomendadas: no aplica; el autor entreno y evaluo solo en CPU.
- Cabe en cualquier equipo consumer: el repositorio ocupa 0,0 GB y los pesos se cargan desde un unico `model.json`.
- Despliegue: no usa vLLM, llama.cpp, Ollama ni TGI. La integracion se hace importando `classify` desde `infer.py` con la biblioteca estandar de Python.
- Latencia y throughput: el autor reporta 0,018 s para ajuste y vectorizacion en su maquina, sin datos de latencia de inferencia en produccion.

## Comparativa con modelos similares

No se dispone de comparativas con otros modelos de deteccion de prompt injection en la informacion proporcionada. El unico baseline documentado es la regex fija incluida en la propia model card, cuyos resultados aparecen en la tabla de benchmarks.

| Modelo | Parametros | Contexto | F1 test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| deteccao-prompt-injection (TF-IDF + LR) | 1.184 caracteristicas | 12.000 caracteres | 77,8% | MIT | Hugging Face, demo en Spaces, codigo en GitHub |
| Regex fija (baseline del autor) | no aplica | no aplica | 35,3% | MIT (incluida) | En la model card |

## Limitaciones y advertencias

- No es un firewall de produccion ni una frontera de seguridad; el autor lo declara explicitamente fuera de alcance para bloquear o autorizar acciones sensibles.
- El corpus es sintetico (816 textos) y el test cubre solo cuatro familias; no hay evidencia de generalizacion a trafico real.
- No hay promesa multilingue: solo se declara portugues y no se evaluo en otros idiomas.
- Sesgos conocidos no documentados de forma explicita; el autor advierte de falsos positivos en textos legitimos sobre seguridad, citas de ataques y modificaciones de peticiones.
- Riesgo de falsos negativos: se documenta una inyeccion indirecta clasificada con 0,248, por debajo del umbral.
- La probabilidad de salida es un escore sigmoide, no una confianza calibrada de seguridad; no debe interpretarse como tal.
- Las contribuciones de terminos explican el calculo lineal, no la intencion del autor del texto.
- Limite duro de 12.000 caracteres Unicode por entrada.
- Uso comercial permitido por licencia MIT, pero el uso previsto es ensenanza y experimentacion independiente; el autor desaconseja usarlo para certificar seguridad de textos o sustituir controles de acceso.
- No lee imagenes, herramientas ni contexto de conversacion, por lo que no cubre inyecciones indirectas que lleguen por esas vias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyochi-daniel/deteccao-prompt-injection
- Demostracion interactiva: https://huggingface.co/spaces/kyochi-daniel/deteccao-prompt-injection-demo
- Codigo en GitHub: https://github.com/kyochi-daniel/deteccao-prompt-injection
- OWASP, LLM Prompt Injection Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
- Microsoft, defensa contra prompt injection indirecta: https://www.microsoft.com/en-us/msrc/blog/2025/07/how-microsoft-defends-against-indirect-prompt-injection-attacks
