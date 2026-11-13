# rantal-ai/RANTAL-LM-23M

## Resumen

RANTAL-LM-23M es un modelo de lenguaje de tipo base, entrenado desde cero por el usuario rantal-ai sobre un corpus monolingüe en polaco compuesto por intervenciones parlamentarias del Sejm de la República de Polonia, obtenidas a través de la API oficial del Sejm y exportadas desde la base de datos del proyecto slowasejmu.pl. Con 23.033.856 parámetros, se sitúa en la categoría de modelos pequeños orientados a experimentación e investigación más que a producción.

El modelo emplea una arquitectura transformer de tipo decoder-only con un tokenizador BPE propio de 32.000 tokens y una ventana de contexto de solo 256 tokens, lo que limita su uso a continuaciones cortas. El checkpoint publicado corresponde al paso 400 de entrenamiento y presenta una perplejidad de 404,14 medida sobre 2.346.933 tokens del conjunto de test, un valor que refleja un ajuste todavía muy débil y que el propio autor advierte que puede producir texto incoherente y repeticiones.

Su relevancia actual es limitada y de carácter experimental: se trata de un ejercicio de entrenamiento desde cero sobre un dominio muy específico (discurso parlamentario polaco) con recursos mínimos. No obstante, resulta útil como referencia para estudiar el comportamiento de modelos de escala reducida en corpus especializados y para tareas de investigación sobre tokenización y dominio lingüístico acotado. La licencia de los pesos y las condiciones de reutilización de los datos están pendientes de verificación según la propia model card, por lo que no se garantiza su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (detalles no disponibles) |
| Parametros totales | 23.033.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | polaco (pl) |
| Licencia | no disponible (en verificacion segun el autor) |
| Formato de pesos | safetensors, PyTorch |

## Arquitectura y entrenamiento

La model card describe un modelo base entrenado desde cero sobre intervenciones parlamentarias, con un tokenizador BPE propio de vocabulario 32.000. No se especifican detalles de la arquitectura interna (número de capas, dimensión oculta, número de cabezas de atención, tipo de normalización ni función de activación), por lo que estos datos deben considerarse no disponibles. El contexto máximo es de 256 tokens, coherente con un diseño de bajo coste computacional.

El corpus de entrenamiento comprende 39.691 intervenciones fechadas entre el 13 de noviembre de 2023 y el 29 de mayo de 2026, mientras que el conjunto de test incluye 5.511 intervenciones del 9 de junio al 16 de septiembre de 2026. El autor indica que se realizó deduplicación tras normalizar Unicode y espacios en blanco, y que la partición se hizo por fecha para evitar fuga de información entre train y test. No se menciona el número total de tokens de entrenamiento, la composición exacta del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO; tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto en polaco: continuaciones de texto breve dentro de la ventana de 256 tokens.
- Modelo base sin ajuste por instrucciones: no está entrenado para seguir instrucciones ni para mantener diálogos multi-turno.
- Dominio especializado: el vocabulario y el estilo están sesgados hacia el registro parlamentario polaco.
- Sin soporte documentado de tool calling ni function calling.
- Sin soporte documentado de razonamiento multi-paso ni comportamiento agéntico.
- Sin capacidades multimodales (visión, audio) ni modo de razonamiento explícito (thinking mode).
- Multilingüismo: únicamente polaco según la etiqueta de idioma del repositorio.

## Casos de uso

- Investigación sobre tokenización BPE en dominios especializados: el modelo permite estudiar cómo un vocabulario de 32.000 tokens entrenado sobre discurso parlamentario representa terminología política y jurídica polaca, comparándolo con tokenizadores generalistas.
- Experimentación académica con modelos de escala reducida: sirve como baseline de 23 millones de parámetros para estudiar curvas de aprendizaje, perplejidad y estabilidad del entrenamiento en corpus monolingües.
- Generación de continuaciones de texto parlamentario para análisis estilístico: útil para examinar patrones retóricos y fórmulas recurrentes del discurso del Sejm, siempre con revisión humana dada la baja calidad esperada.
- Pruebas de pipelines de inferencia en CPU: al ocupar aproximadamente 0,1 GB en safetensors, permite validar flujos con PyTorch, safetensors y tokenizers en entornos sin GPU.
- Docencia sobre entrenamiento desde cero: el repositorio incluye un script `model.py` que facilita demostrar el ciclo completo de carga de pesos, tokenización y generación en un caso real.
- Evaluación de técnicas de deduplicación y partición temporal de datasets: la documentación del split por fechas permite reproducir metodologías de evaluación sin fuga temporal en corpus con evolución diacrónica.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| Perplejidad | 404,14 | Conjunto de test completo, 2.346.933 tokens, paso 400 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precisión completa (23 millones de parámetros en fp32 ocupan aproximadamente 92 MB; el repositorio completo pesa 0,1 GB).
- GPU recomendadas: cualquier GPU con al menos 1 GB de memoria; no requiere aceleradores de datacenter como A100 o H100.
- Compatibilidad con GPU de consumo: sí, cabe holgadamente en cualquier RTX, GTX o iGPU moderna, e incluso en Raspberry Pi y otros dispositivos de bajo consumo.
- Opciones de despliegue: el autor documenta ejecución en CPU con PyTorch, safetensors y tokenizers mediante `python model.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la ausencia de pesos en formato GGUF limita el uso directo con llama.cpp.
- Latencia y throughput: no disponibles. Dado el tamaño y el contexto de 256 tokens, se espera una latencia muy baja en CPU, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| RANTAL-LM-23M | 23.033.856 | 256 | pl | no disponible | safetensors |
| Modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma categoría (modelos base monolingües de unos 20-30 millones de parámetros) en la documentación proporcionada, por lo que no es posible establecer una comparativa rigurosa con alternativas.

## Limitaciones y advertencias

- Calidad de generación muy baja: perplejidad de 404,14 y advertencia explícita del autor sobre texto incoherente y repeticiones.
- Entrenamiento incompleto: el checkpoint corresponde al paso 400, sin indicios de convergencia.
- Ventana de contexto muy reducida (256 tokens), insuficiente para la mayoría de aplicaciones prácticas.
- Modelo base sin ajuste por instrucciones: no responde a prompts en formato conversacional ni sigue directrices.
- Monolingüe en polaco: no apto para tareas en castellano u otros idiomas.
- Sesgos potenciales derivados del corpus: discurso parlamentario con sobrerrepresentación de ciertos grupos políticos, registros formales y temáticas legislativas.
- Riesgo elevado de alucinación y de generar afirmaciones factualmente incorrectas, especialmente en dominios ajenos al corpus.
- Licencia no disponible: los pesos y las condiciones de reutilización de los datos están en verificación, por lo que no se recomienda su uso comercial hasta que se aclare.
- Sin garantías de soporte, mantenimiento ni actualizaciones por parte del autor.
- No recomendado para producción en ningún escenario sin una evaluación adicional exhaustiva.

## Enlaces

- Hugging Face: https://huggingface.co/rantal-ai/RANTAL-LM-23M
- API del Sejm de la República de Polonia: https://api.sejm.gov.pl/sejm.html
- Proyecto slowasejmu.pl (fuente de los datos, sin URL directa en la model card): no disponible
