# kyochi-daniel/prompt-sentinel-academico

## Resumen

Prompt Sentinel Académico es un clasificador binario de texto desarrollado por el usuario kyochi-daniel, publicado en Hugging Face bajo licencia MIT. No es un modelo de lenguaje generativo ni un transformer: se trata de un pipeline clásico de scikit-learn que combina vectorización TF-IDF (unigramas y bigramas) con regresión logística para distinguir entre texto benigno (`benigno`) y tentativas de inyección de prompt (`injecao`) en portugués brasileño.

El modelo nace como un estudio educativo independiente para demostrar el ciclo completo de entrenamiento, particionado por familias, evaluación y inferencia local sin dependencias externas. Su corpus es sintético y autoral (816 textos generados a partir de plantillas y temas), con particiones de entrenamiento, validación, test y un conjunto de desafío manual. La implementación de inferencia usa solo la biblioteca estándar de Python y no requiere Transformers ni GPU.

Su relevancia es acotada y debe entenderse como material didáctico: sirve para ilustrar cómo un clasificador lineal ligero puede superar a una baseline de expresiones regulares en la detección de patrones de inyección, pero el propio autor advierte explícitamente que no constituye un firewall de producción ni una frontera de seguridad. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (unigramas y bigramas) + regresión logística (scikit-learn) |
| Parametros totales | 1.184 features (vocabulario TF-IDF); coeficientes del modelo lineal no cuantificados en la información disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; límite de entrada de 12.000 caracteres Unicode |
| Tipos de cuantizacion | no disponible (no aplica; modelo lineal en JSON) |
| Idiomas soportados | portugués (pt), concretamente portugués brasileño |
| Licencia | MIT (código, corpus autoral y pesos) |
| Formato de pesos | JSON (`model.json`) con implementación customizada en Python |

## Arquitectura y entrenamiento

El pipeline aplica normalización NFKD, eliminación de marcas Unicode, conversión a minúsculas y tokenización con el patrón `[a-z0-9_]{2,}`, generando unigramas y bigramas. Sobre esa representación se aplica TF sublinear (`1+ln(conteo)`), IDF suavizado y normalización L2, alimentando una regresión logística con `C=4` y solver `liblinear`. El vocabulario y el IDF se ajustan exclusivamente sobre el conjunto de entrenamiento, y los hiperparámetros se fijaron antes de evaluar (seed 42, umbral 0,50). El resultado son 1.184 features.

El corpus es sintético y autoral: 816 textos con clases balanceadas en todas las particiones (512 entrenamiento, 128 validación, 128 test y 48 de desafío manual). Las primeras 768 muestras derivan de 24 familias con cuatro plantillas por familia y ocho temas por plantilla; las familias y plantillas quedan íntegras en una única partición, mientras que los temas se comparten entre clases para evitar fuga trivial de información. El desafío usa textos individuales sin expansión por plantillas. El entrenamiento se realizó solo en CPU con Python 3.12.13 y scikit-learn 1.9.0, con un tiempo de ajuste y vectorización de 0,018 s. El SHA-256 del corpus es `cbf542b3397d1495c8b5424e3c8b52de8e01fbf9d17306211b4c0395f1f6f27c`.

## Capacidades

- Clasificación binaria de texto en portugués: etiqueta `benigno` o `injecao` con un umbral fijo de 0,50.
- Detección de patrones léxicos asociados a inyección de prompt (instrucciones de ignorar reglas, revelar el prompt del sistema, solicitar secretos, etc.).
- Salida de probabilidad como score sigmoide de la regresión, no calibrado como confianza de seguridad.
- Contribuciones de términos que explican el cálculo lineal del modelo (no la intención del autor del texto).
- Inferencia local sin red: el script `infer.py` no envía textos a ningún servicio externo.
- Integración programática mediante `classify(texto, modelo)` importable desde Python.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio, thinking mode ni contexto conversacional.
- No lee imágenes, herramientas ni contexto de conversación; solo texto plano.

## Casos de uso

- Docencia y talleres de seguridad en IA: el modelo sirve para que estudiantes comparen un clasificador lineal entrenado con una baseline de expresiones regulares y analicen matrices de confusión (TN/FP/FN/TP) sobre un corpus controlado.
- Demostración de pipelines de NLP clásico: ilustra el flujo completo de normalización, TF-IDF, ajuste de IDF solo en entrenamiento y evaluación en particiones separadas, sin dependencias de GPU.
- Prototipado rápido de filtros léxicos: puede usarse como primer filtro heurístico en un entorno de pruebas para etiquetar textos sospechosos antes de un análisis humano, siempre con revisión posterior.
- Investigación sobre prompt injection en portugués: proporciona un corpus sintético reproducible (SHA-256 documentado) para experimentar con variantes de plantillas y medir sensibilidad a falsos positivos y negativos.
- Inferencia en el navegador o en entornos restringidos: al usar solo la biblioteca estándar de Python y un archivo JSON, puede ejecutarse en máquinas sin GPU ni frameworks de deep learning.
- Ejercicio de evaluación crítica: sus ejemplos documentados de falso positivo (0,902 ante una pregunta legítima sobre la expresión "ignore as instruções anteriores") y falso negativo (0,248 ante una solicitud indirecta de contenido privado) sirven para discutir los límites de los clasificadores léxicos.
- Integración en scripts de anotación: puede preetiquetar lotes de textos en portugués para que anotadores humanos revisen y corrijan, acelerando la construcción de datasets de seguridad.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card son los siguientes (clases balanceadas; clase positiva = inyección):

| Partición | Método | Precisión | Recall | F1 | TN / FP / FN / TP |
|---|---|---:|---:|---:|---|
| Validación | Modelo | 77,8% | 87,5% | 82,4% | 48 / 16 / 8 / 56 |
| Test | Modelo | 70,0% | 87,5% | 77,8% | 40 / 24 / 8 / 56 |
| Test | Regex fija | 33,3% | 37,5% | 35,3% | 16 / 48 / 40 / 24 |
| Desafío | Modelo | 63,6% | 87,5% | 73,7% | 12 / 12 / 3 / 21 |
| Desafío | Regex fija | 35,7% | 20,8% | 26,3% | 15 / 9 / 19 / 5 |

La baseline de regex detecta los términos `ignore`, `desconsidere`, `esqueça`, `revele`, `senhas`, `segredos`, `system`, `sem filtros` o `prompt interno` tras la misma normalización. El autor advierte que el test mide solo cuatro familias, que las variantes correlacionadas no son observaciones independientes y que no hay evaluación en tráfico real ni estimación robusta de generalización.

## Requisitos de hardware

- VRAM: no aplica; el modelo es lineal y se ejecuta en CPU.
- GPU: no requiere ninguna; el entrenamiento y la inferencia se realizaron solo en CPU.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y entornos sin aceleración.
- Despliegue: script Python local (`infer.py`) con biblioteca estándar; también existe una demo interactiva en Hugging Face Spaces. No hay soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de Transformers.
- Latencia y throughput: el ajuste y la vectorización se midieron en 0,018 s en la máquina del autor, excluyendo instalación, generación del corpus y tests. No se han publicado cifras de latencia de inferencia ni throughput.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prompt Sentinel Académico | TF-IDF + regresión logística | 1.184 features | 12.000 caracteres de entrada | MIT | Hugging Face, 0 descargas |
| Baseline de regex descrita en la model card | Reglas léxicas | no aplica | no aplica | no disponible | Incluida como comparación en la model card |
| Clasificadores de prompt injection basados en transformers | Transformer encoder | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

No se dispone de datos sobre otros clasificadores comparables en la información proporcionada; la única comparación documentada es contra la baseline de expresiones regulares del propio autor.

## Limitaciones y advertencias

- No es un firewall de producción ni una frontera de seguridad; el autor lo declara explícitamente fuera de alcance para bloquear o autorizar acciones sensibles.
- El score de probabilidad es un sigmoide de la regresión, no una confianza calibrada de seguridad.
- Las contribuciones de términos explican el cálculo lineal, no la intención real del autor del texto.
- Solo cubre portugués brasileño; no hay promesa multilingüe ni evaluación en otros idiomas.
- Corpus sintético de 816 textos con solo cuatro familias en el test; las variantes correlacionadas no son observaciones independientes.
- Sin evaluación en tráfico real ni estimación robusta de generalización.
- Falsos positivos documentados en textos legítimos sobre seguridad, citas de ataques y modificaciones legítimas de peticiones (ejemplo: pregunta sobre la expresión "ignore as instruções anteriores" con score 0,902).
- Falsos negativos documentados ante solicitudes indirectas (ejemplo: petición de generar un enlace con contenido privado, score 0,248).
- Un resultado benigno nunca autoriza ejecutar instrucciones; el modelo no sustituye controles de acceso ni aislamiento.
- Límite de entrada de 12.000 caracteres Unicode.
- Requiere la implementación customizada incluida en el repositorio; no funciona con Transformers ni con endpoints automáticos de Hugging Face.
- Licencia MIT permite uso comercial del código, corpus y pesos, pero el uso previsto es enseñanza y experimentación; el uso comercial en producción de seguridad no está respaldado por el autor.
- El corpus no contiene conversaciones recolectadas ni credenciales reales; las URLs `.invalid` son ficticias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kyochi-daniel/prompt-sentinel-academico
- Demo interactiva: https://huggingface.co/spaces/kyochi-daniel/prompt-sentinel-demo
- Código en GitHub: https://github.com/kyochi-daniel/prompt-sentinel-academico
- Referencia OWASP sobre prevención de prompt injection: https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
- Blog de Microsoft sobre defensa frente a prompt injection indirecta: https://www.microsoft.com/en-us/msrc/blog/2025/07/how-microsoft-defends-against-indirect-prompt-injection-attacks
