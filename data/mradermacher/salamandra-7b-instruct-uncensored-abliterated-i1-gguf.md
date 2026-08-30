# mradermacher/salamandra-7b-instruct-Uncensored-Abliterated-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `salamandra-7b-instruct-Uncensored-Abliterated`, generadas por el usuario mradermacher. El modelo original, publicado por Securelayer7, es una versión "uncensored" y "abliterated" de un modelo de 7 mil millones de parámetros, lo que implica que se ha aplicado una técnica de eliminación de rechazos (abliteration) para reducir las negativas del modelo ante solicitudes controvertidas. Los archivos GGUF están optimizados con imatrix (importance matrix) y están pensados para su uso con motores de inferencia compatibles con este formato, como llama.cpp, Ollama o LM Studio.

La relevancia de este modelo radica en su tamaño compacto (7,7B parámetros) y su naturaleza "uncensored", que lo hace atractivo para aplicaciones de generación de texto libre, roleplay o asistentes conversacionales sin restricciones temáticas. Sin embargo, la información técnica disponible es limitada: no se especifican la arquitectura exacta, el contexto máximo, los idiomas soportados ni la licencia, por lo que cualquier despliegue en producción requiere verificar estos aspectos con el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 7.768.117.248 (aprox. 7,7B) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (segun comentarios del autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original. El nombre sugiere que se trata de un transformer de 7B parametros, probablemente basado en una arquitectura similar a Llama o Mistral, pero no hay confirmacion. Tampoco se conocen los datos de entrenamiento, el numero de tokens utilizados ni si se aplicaron tecnicas como RLHF o DPO. La unica informacion relevante es que el modelo ha pasado por un proceso de "abliteration" (eliminacion de capas o pesos asociados a comportamientos de rechazo) y que las cuantizaciones se han generado con imatrix para mejorar la calidad de la cuantizacion.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como "conversational" y su naturaleza "uncensored" permite respuestas sin filtros tematicos.
- Soporte de cuantizacion GGUF: al estar disponible en multiples cuantizaciones, puede ejecutarse en hardware variado, desde CPU hasta GPUs de gama media.
- Compatibilidad con motores de inferencia: los archivos GGUF son compatibles con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato.
- No se dispone de informacion sobre capacidades especificas como tool calling, razonamiento multi-paso, vision o audio.

## Casos de uso

- Roleplay y narrativa interactiva: al ser "uncensored", puede generar dialogos y escenas sin restricciones de contenido, util para juegos de rol o escritura creativa.
- Asistentes conversacionales sin filtros: para entornos donde se requiere una respuesta directa sin censura previa, como simulaciones o chatbots de nicho.
- Experimentacion con tecnicas de abliteration: investigadores pueden estudiar el comportamiento de un modelo al que se le han eliminado los rechazos, comparandolo con la version original.
- Despliegue local en hardware modesto: gracias a las cuantizaciones IQ y Q, puede ejecutarse en GPUs con 6-8 GB de VRAM o incluso en CPU con suficiente RAM.
- Generacion de contenido creativo: cuentos, poemas, guiones, etc., sin limitaciones de tema.
- Pruebas de alineacion y seguridad: para evaluar los riesgos de modelos sin restricciones y disenar contramedidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras metricas estandar.

## Requisitos de hardware

- VRAM estimada: para un modelo de 7,7B parametros, las cuantizaciones Q4_K_M o IQ4_XS requieren aproximadamente 4-5 GB de VRAM; las Q2 o IQ1 pueden bajar a 3 GB, mientras que Q6_K o Q8 necesitan 6-7 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, GTX 1080 Ti) puede ejecutar las cuantizaciones mas bajas. Para las mas altas, se recomienda 8 GB o mas (RTX 3070, RTX 4070, etc.).
- En CPU: con 16 GB de RAM y una cuantizacion Q4_K_M, es posible ejecutar el modelo a velocidades de 2-4 tokens por segundo, dependiendo del procesador.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (si se convierte a otro formato), o cualquier motor compatible con GGUF.
- Latencia y throughput: no se dispone de mediciones concretas; dependen del hardware y la cuantizacion elegida.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa fiable. El modelo pertenece a la categoria de "7B uncensored GGUF", donde existen alternativas como `TheBloke/dolphin-2.2.1-mistral-7B-GGUF` o `TheBloke/OpenHermes-2.5-Mistral-7B-GGUF`, pero no se tienen datos de rendimiento ni licencias para contrastar.

## Limitaciones y advertencias

- Contenido sin filtrar: al ser "uncensored" y "abliterated", el modelo puede generar contenido ofensivo, ilegal o peligroso. No es apto para uso en produccion sin supervision humana.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede inventar hechos o datos, especialmente en temas especializados.
- Licencia desconocida: no se especifica la licencia, lo que impide su uso comercial o redistribucion sin autorizacion explicita del autor original.
- Informacion tecnica incompleta: se desconoce la arquitectura exacta, el contexto maximo y los idiomas soportados, lo que dificulta su integracion en sistemas que requieran garantias.
- Sesgos: al no conocer los datos de entrenamiento, no se puede evaluar la presencia de sesgos de genero, raza o ideologicos.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/salamandra-7b-instruct-Uncensored-Abliterated-i1-GGUF
- Modelo original (Securelayer7): https://huggingface.co/Securelayer7/salamandra-7b-instruct-Uncensored-Abliterated
- Otros modelos GGUF del mismo autor: https://huggingface.co/mradermacher (pagina de perfil)
