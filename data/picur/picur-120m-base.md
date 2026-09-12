# picur/picur-120M-base

## Resumen

picur-120M-base es un modelo de generacion de texto de tipo base, publicado por el usuario picur en HuggingFace, con 120.404.352 parametros (unos 120,4 M) y pesos en safetensors para la libreria transformers. La etiqueta de arquitectura del repositorio es lfm2, lo que lo situa en la familia de modelos hibridos de Liquid AI que combinan bloques de convolucion con atencion, aunque la model card no documenta la configuracion concreta de capas de esta variante. Esta entrenado y orientado exclusivamente al hungaro (hu), con licencia Apache-2.0.

Su relevancia es doble. Por un lado, cubre un nicho poco poblado: modelos pequenos y de licencia permisiva para hungaro, idioma con menos recursos que el ingles o el castellano en el ecosistema de modelos abiertos. Por otro, su tamano (0,2 GB de repositorio, ~0,24 GB en bfloat16) lo hace apto para experimentacion en una sola GPU de consumo, inferencia en CPU y uso como modelo borrador en decodificacion especulativa.

Conviene ser cauto: la propia model card lo marca como "PREVIEW", no incluye informacion sobre datos de entrenamiento, longitud de contexto ni proceso de alineacion, y el repositorio acumula 0 descargas y 0 likes en el momento de la consulta. Es, por tanto, un artefacto experimental y no un modelo listo para produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm2 (hibrida de convolucion y atencion, segun la etiqueta del repositorio; configuracion de capas no documentada) |
| Parametros totales | 120.404.352 (~120,4 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el unico ejemplo oficial de uso carga el modelo en bfloat16 y no se publican pesos cuantizados |
| Idiomas soportados | hungaro (hu) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria de referencia | transformers |
| Pipeline declarado | text-generation |
| Tamano del repositorio | 0,2 GB |
| Tipo de modelo | base (sin ajuste por instrucciones documentado) |

## Arquitectura y entrenamiento

La unica informacion fiable sobre la arquitectura es la etiqueta `lfm2` del repositorio. LFM2 es la familia de modelos hibridos de Liquid AI, que intercala bloques de convolucion corta con puertas (gated short convolutions) y bloques de atencion con consultas agrupadas (GQA), en lugar de apilar unicamente capas de atencion completa. Esta combinacion esta pensada para reducir el coste por token y mejorar el comportamiento en inferencia en CPU y en dispositivos de borde. No hay confirmacion, en la informacion disponible, de cuantas capas de cada tipo tiene esta variante de 120 M ni de sus dimensiones internas.

El resto del proceso de entrenamiento es opaco en la documentacion publicada: no se indica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de ajuste supervisado, RLHF o DPO, ni si se practico decodificacion especulativa durante el entrenamiento. Tampoco se detalla el tokenizador mas alla de que se carga con `AutoTokenizer`. La model card se limita a un ejemplo de generacion en hungaro con `temperature=0.7` y `max_new_tokens=100`. Cualquier afirmacion sobre datos, fases de alineacion o innovaciones de entrenamiento seria especulacion.

## Capacidades

- Generacion de texto en hungaro: completado de textos y continuacion de prompts, tal como ilustra el ejemplo oficial ("Egyszer volt hol nem volt, a digitalis tengeren ...").
- Modelo base: realiza modelado de lenguaje autoregresivo; no hay evidencia de un modo de instrucciones, de chat ni de plantilla de conversacion publicada.
- Punto de partida para ajuste fino: al ser un modelo pequeno y con licencia Apache-2.0, es adecuado como inicializacion para tareas supervisadas en hungaro (clasificacion, extraccion, resumen).
- Ausencia de tool calling o function calling: no se documenta soporte de llamadas a herramientas ni de agentes.
- Ausencia de capacidades multimodales: no hay soporte de vision, audio ni voz declarado.
- Multilinguismo: no disponible; el repositorio declara unicamente el hungaro.
- Razonamiento explicito o "modo pensamiento": no disponible ni documentado.

## Casos de uso

- Generacion y completado de texto en hungaro: uso directo para redactar borradores, continuar parrafos o generar variantes de un texto a partir de un prefijo, aprovechando el unico idioma para el que esta declarado.
- Modelo borrador en decodificacion especulativa: por su tamano (120 M) puede actuar como draft model que propone varios tokens y deja que un modelo mayor en hungaro los verifique, reduciendo la latencia de generacion; requiere verificar compatibilidad de tokenizador.
- Experimentacion en una sola GPU: sirve para reproducir recetas de entrenamiento, probar tasas de aprendizaje o hacer ablaciones de ajuste fino con un coste de memoria minimo.
- Ajuste fino para tareas de PLN en hungaro: clasificacion de textos, analisis de sentimiento o etiquetado de secuencias partiendo de los pesos base, con la ventaja de la licencia Apache-2.0 para uso comercial del derivado.
- Generacion de datos sinteticos en hungaro: producir corpus de aumento para entrenar modelos mayores o para preentrenar componentes auxiliares, siempre con revision humana por el riesgo de alucinacion.
- Inferencia en el borde o en local: al ocupar del orden de 0,24 GB en bfloat16, puede ejecutarse en CPU, en un portatil o en un dispositivo embebido sin GPU, por ejemplo para autocompletado en editores de texto en hungaro o funciones de asistencia con requisitos de privacidad estrictos.
- Investigacion academica sobre arquitecturas hibridas: comparar el comportamiento de un LFM2 de 120 M frente a transformers densos de tamano similar en una lengua aglutinante como el hungaro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K, HellaSwag ni de evaluaciones especificas para hungaro (por ejemplo, pruebas de comprension lectora o traduccion). Tampoco hay estimaciones de latencia o throughput medidas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del numero de parametros, no medida): unos 0,24 GB en bfloat16 o float16, unos 0,48 GB en float32, unos 0,13 GB en int8 y alrededor de 0,07-0,09 GB en cuantizaciones de 4 bits, mas la memoria del cache KV, cuyo tamano no puede calcularse porque se desconoce la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente en la practica; el modelo cabe sobradamente en RTX 3060, RTX 4090, A100 o H100, que estarian infrautilizadas en cuanto a memoria.
- GPU de consumo: si, cabe en cualquier GPU de consumo actual e incluso en iGPUs con memoria compartida. En CPU la inferencia es viable por el reducido numero de parametros.
- Opciones de despliegue: transformers es la via documentada. No se publican pesos GGUF, por lo que el uso con llama.cpp u Ollama exige una conversion previa. El soporte en vLLM, TGI u otros servidores depende de que la version utilizada reconozca la arquitectura lfm2; conviene verificarlo antes de integrarlo.
- Latencia y throughput: no disponible. No se han publicado mediciones y cualquier cifra seria una estimacion sin respaldo.

## Comparativa con modelos similares

Los datos de los modelos de referencia proceden de conocimiento general y no han podido verificarse en la busqueda realizada; deben confirmarse antes de citarlos.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formatos |
|---|---|---|---|---|---|
| picur-120M-base | 120,4 M | no disponible | hu | Apache-2.0 | safetensors |
| SmolLM2-135M | ~135 M | no verificado | principalmente en | Apache-2.0 (no verificado en esta busqueda) | safetensors, GGUF |
| Qwen2.5-0.5B | ~494 M | no verificado | multilingue (no verificado) | Apache-2.0 (no verificado en esta busqueda) | safetensors, GGUF |
| LFM2-350M (Liquid AI) | ~350 M | no verificado | multilingue (no verificado) | licencia comunitaria de Liquid AI (no verificado en esta busqueda) | safetensors, GGUF |

Diferenciacion: picur-120M-base es el unico de la tabla declarado explicitamente para hungaro y con licencia Apache-2.0 sin restricciones conocidas, pero tambien es el unico cuya longitud de contexto, datos de entrenamiento y calidad no estan documentados.

## Limitaciones y advertencias

- Modelo en estado "PREVIEW": el propio autor lo etiqueta como vista previa, sin garantias de estabilidad ni de calidad.
- Sin datos de evaluacion: no hay benchmarks publicados, por lo que no puede afirmarse su rendimiento relativo frente a alternativas.
- Riesgo de alucinacion: al ser un modelo base de 120 M sin alineacion documentada, la generacion puede ser incoherente, repetitiva o factualmente incorrecta; requiere revision humana en cualquier uso con salida visible.
- Ambito limitado a un idioma: solo declara hungaro; no hay evidencia de competencia en castellano, ingles u otras lenguas.
- Contexto desconocido: al no publicarse la ventana de contexto, no se pueden disenar aplicaciones con requisitos de contexto largo sin una prueba previa.
- Inconsistencia en las etiquetas: el repositorio incluye la etiqueta "conversational" mientras que la model card lo presenta como base y no documenta plantilla de chat ni ajuste por instrucciones. No debe asumirse comportamiento conversacional.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad y mayor riesgo de defectos no detectados.
- Sesgos: no disponibles; no se documenta la composicion del corpus, por lo que no puede evaluarse el sesgo de genero, politico o cultural.
- Licencia: Apache-2.0 permite uso comercial, pero esa permisibilidad solo cubre los pesos publicados; si se usa como base para un ajuste fino, el equipo debe validar por su cuenta el cumplimiento de cualquier requisito adicional derivado de la arquitectura lfm2.
- Produccion: no se recomienda su despliegue directo sin una bateria de evaluacion propia, y conviene fijar la revision exacta del repositorio porque puede cambiar sin aviso.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/picur/picur-120M-base
- Referencia de la familia arquitectonica lfm2 (no verificada en esta busqueda): https://huggingface.co/LiquidAI/LFM2-350M
- Busqueda web: no se encontro ningun enlace relevante sobre este modelo. Los resultados devueltos correspondian a consultas no relacionadas (abreviaturas medicas, paginas de Zhihu y Baidu, foros de videojuegos y productos de audio), por lo que no se incluyen.
