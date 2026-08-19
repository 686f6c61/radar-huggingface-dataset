# mradermacher/Agents-A1-i1-GGUF

## Resumen

Agents-A1-i1-GGUF es una cuantización en formato GGUF del modelo Agents-A1, desarrollado por InternScience y cuantizado por mradermacher. Agents-A1 es un modelo de mezcla de expertos (MoE) de 34,7 mil millones de parámetros, diseñado específicamente para tareas agénticas y multimodales (visión y lenguaje). El modelo base se presenta como capaz de alcanzar un rendimiento comparable a modelos de billones de parámetros mediante el escalado del "horizonte del agente", es decir, ampliando la longitud de las trayectorias de razonamiento y la diversidad de habilidades agénticas.

Esta versión i1 incluye un archivo de importancia (imatrix) para generar cuantizaciones personalizadas de alta calidad, mientras que los cuantizados estáticos se publican en un repositorio hermano. El modelo está pensado para desarrolladores e investigadores que necesitan ejecutar Agents-A1 en entornos locales o en producción con requisitos de memoria reducidos, manteniendo un equilibrio entre rendimiento y eficiencia.

La licencia Apache-2.0 permite uso comercial sin restricciones significativas, lo que lo convierte en una opción atractiva para integraciones empresariales. Sin embargo, la información pública sobre detalles de entrenamiento, benchmarks y capacidades específicas es limitada, por lo que esta ficha se basa en los datos disponibles y en las características generales de la arquitectura MoE agéntica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con visión (VLM) y capacidades agénticas |
| Parametros totales | 34.660.610.688 (34,7 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (archivo de importancia); los cuantizados estáticos (Q2_K, Q4_K_M, Q6_K, etc.) estan disponibles en el repositorio hermano mradermacher/Agents-A1-GGUF |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

Agents-A1 es un modelo de mezcla de expertos (MoE) con componentes multimodales (visión y texto) y un diseño orientado a agentes. Según el repositorio oficial de InternScience, el modelo explora el escalado del "horizonte del agente" desde dos perspectivas: el escalado de trayectorias de largo alcance (secuencias de razonamiento y acción prolongadas) y el escalado de habilidades agénticas heterogéneas (capacidades como tool use, planificación, reflexión, etc.). No se han publicado detalles sobre el número de expertos, el tamaño de los parámetros activos, la composición del dataset de entrenamiento, el número de tokens procesados ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifica la longitud de contexto máxima soportada.

La cuantización i1 de mradermacher utiliza el método imatrix (importance matrix) para optimizar la distribución de pesos durante la cuantización, lo que suele mejorar la calidad de los cuantizados de baja precisión. El archivo imatrix incluido en este repositorio permite a los usuarios generar sus propias cuantizaciones personalizadas con herramientas como llama.cpp.

## Capacidades

- Modelo multimodal: procesa tanto texto como imágenes (etiquetado como VLM).
- Capacidades agénticas: diseñado para tareas que requieren razonamiento multi-paso, planificación y uso de herramientas (según la etiqueta "agentic" y la descripción del modelo base).
- Conversacional: apto para diálogos multi-turno.
- Soporte de tool calling y function calling: aunque no se detalla explícitamente en la información disponible, la naturaleza agéntica del modelo y la comparación con modelos similares (como Agentic-30B-A3B) sugieren que puede integrar llamadas a funciones.
- Idiomas: solo inglés (según la etiqueta "en").

## Casos de uso

- Automatización de tareas de oficina: el modelo puede interpretar documentos escaneados o capturas de pantalla y ejecutar acciones como rellenar formularios, extraer datos o generar resúmenes, gracias a su capacidad de visión y razonamiento agéntico.
- Asistentes virtuales para soporte técnico: con su naturaleza conversacional y posible tool calling, puede gestionar incidencias de usuarios, consultar bases de conocimiento y escalar problemas complejos a humanos.
- Análisis de imágenes médicas o industriales: su componente de visión permite detectar anomalías en radiografías, imágenes de satélite o líneas de producción, combinado con razonamiento para generar informes.
- Agentes autónomos de navegación web: puede planificar y ejecutar secuencias de acciones en un navegador (rellenar formularios, hacer clic, extraer información) para automatizar tareas como reservas o compras.
- Generación de código con contexto visual: a partir de capturas de pantalla de una interfaz, puede generar o modificar código front-end, o explicar el funcionamiento de una aplicación.
- Investigación académica: como modelo MoE de 34,7 B, puede utilizarse para experimentos de razonamiento multimodal, análisis de trayectorias largas o evaluación de capacidades agénticas en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de InternScience menciona que Agents-A1 alcanza un rendimiento comparable a modelos de billones de parámetros, pero no se proporcionan cifras concretas (MMLU, HumanEval, GSM8K, etc.) en los materiales consultados.

## Requisitos de hardware

- El tamaño del repositorio es de 28,6 GB, lo que sugiere que los archivos GGUF (incluyendo el imatrix) ocupan un espacio considerable. Los cuantizados típicos para un modelo de 34,7 B suelen oscilar entre 15 GB (Q2_K) y 35 GB (Q8_0), aunque no se confirma qué archivos están incluidos en este repo concreto.
- Para inferencia local, se recomienda una GPU con al menos 24 GB de VRAM para cuantizaciones bajas (Q4_K_M o inferiores). Para cuantizaciones medias (Q5, Q6) se necesitan 32 GB o más, y para las altas (Q8) se requieren GPUs profesionales como A100 (80 GB) o H100.
- En consumer GPUs, una RTX 4090 (24 GB) puede ejecutar cuantizaciones Q4 o inferiores con un rendimiento aceptable. Una RTX 3090 o 4080 (16 GB) solo admitiría cuantizaciones muy agresivas (Q2 o IQ2) con pérdida notable de calidad.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), o el ecosistema de Hugging Face Transformers (convirtiendo a safetensors si es necesario).
- La latencia y el throughput dependen en gran medida del hardware y la cuantización; no se dispone de datos específicos para este modelo.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros modelos. El modelo base Agents-A1 se posiciona como un MoE agéntico multimodal, similar en concepto a otros modelos como Qwen3-30B-A3B o Agentic-30B-A3B (también cuantizado por mradermacher). Sin embargo, no hay datos públicos de benchmarks que permitan una comparación objetiva. Se recomienda consultar el repositorio de InternScience para futuras actualizaciones.

## Limitaciones y advertencias

- La información sobre el modelo base es escasa: no se han publicado detalles sobre el entrenamiento, los datos utilizados, la longitud de contexto o los benchmarks, lo que dificulta evaluar su rendimiento real.
- Al ser una cuantización, puede haber una pérdida de calidad respecto al modelo original en precisión flotante, especialmente en tareas que requieren razonamiento matemático o lógico complejo.
- El modelo solo soporta inglés, por lo que no es adecuado para aplicaciones multilingües sin un adaptador adicional.
- Aunque la licencia Apache-2.0 permite uso comercial, el modelo base no ha sido auditado externamente; puede contener sesgos o alucinaciones inherentes a los modelos de lenguaje grandes.
- El repositorio i1 solo incluye el archivo imatrix; los cuantizados GGUF completos se encuentran en el repositorio estático. Los usuarios deben descargar los archivos desde allí si no desean generar sus propios cuantizados.
- No se garantiza la compatibilidad con todos los frameworks de inferencia; se recomienda verificar la compatibilidad con llama.cpp u Ollama antes de su uso en producción.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/mradermacher/Agents-A1-i1-GGUF
- Repositorio HuggingFace con cuantizados estáticos: https://huggingface.co/mradermacher/Agents-A1-GGUF
- Repositorio GitHub del modelo base: https://github.com/InternScience/Agents-A1
- Página de descarga de mradermacher: https://hf.tst.eu/model#Agents-A1-i1-GGUF
