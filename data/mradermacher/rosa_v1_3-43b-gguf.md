# mradermacher/Rosa_v1_3.43B-GGUF

## Resumen

Rosa_v1_3.43B-GGUF es una recuantización estática en formato GGUF del modelo Rosa_v1_3.43B, publicado por el usuario mradermacher en Hugging Face. El repositorio no contiene un modelo original, sino una conversión de los pesos del modelo base (alojado en `guillaume7/Rosa_v1_3.43B`) a una colección de cuantizaciones GGUF listas para su uso con llama.cpp y herramientas compatibles como Ollama o LM Studio. El nombre indica un modelo de aproximadamente 3.430 millones de parámetros (3,43B).

La relevancia de este repositorio es fundamentalmente práctica: facilita el despliegue del modelo base en hardware de consumo mediante cuantizaciones de 2 a 8 bits y en precisión media (F16). Sin embargo, la información publicada es mínima: la model card del repositorio de cuantización no incluye detalles sobre arquitectura, datos de entrenamiento, licencia, idiomas ni benchmarks del modelo original, y el propio modelo base no está descrito en la información disponible.

Por tanto, esta ficha documenta con rigor lo que se puede afirmar (el formato, las cuantizaciones disponibles y el proceso de conversión) y marca explícitamente como "no disponible" todo aquello que no consta en la información proporcionada. Cualquier evaluación de capacidades o rendimiento requeriría consultar el repositorio del modelo base o realizar pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | aproximadamente 3,43B (según el nombre del modelo) |
| Parametros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estáticas); el modelo base se convirtió desde formato Hugging Face (`convert_type: hf`) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base Rosa_v1_3.43B: la model card del repositorio de cuantización no describe si se trata de un transformer denso, un modelo MoE, un híbrido o cualquier otra variante, ni detalla la composición del dataset de entrenamiento, el número de tokens utilizados o si hubo fases de ajuste fino con RLHF/DPO.

Lo único documentado es el proceso de conversión: los metadatos de la model card indican `convert_type: hf` (conversión desde pesos en formato Hugging Face), `quantize_version: 2` y `output_tensor_quantised: 1`, lo que confirma que se generaron cuantizaciones estáticas de los tensores del modelo original. No se han publicado innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) en la información disponible.

## Capacidades

- No se han documentado capacidades específicas del modelo en la información proporcionada.
- No consta soporte de tool calling ni function calling.
- No consta soporte de agentes ni razonamiento multi-paso.
- No consta información sobre capacidades multilingües.
- No consta información sobre modos especiales (thinking mode, visión, audio).
- Por el tamaño (aproximadamente 3,43B parámetros) y el formato GGUF, el modelo es desplegable en local mediante llama.cpp y runtimes compatibles, pero sus capacidades concretas no están verificadas en esta información.

## Casos de uso

- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M y Q4_K_S permiten ejecutar un modelo de aproximadamente 3,43B parámetros en GPU con 4-6 GB de VRAM o incluso en CPU, lo que facilita prototipos sin conexión a servicios en la nube.
- Experimentación con llama.cpp y Ollama: al estar en GGUF, el modelo puede cargarse directamente en estos runtimes para pruebas de generación de texto, siempre que se valide previamente su calidad con el modelo base.
- Integración en aplicaciones de escritorio: herramientas como LM Studio o interfaces basadas en llama.cpp pueden consumir los ficheros GGUF para asistentes locales de texto, sujeto a la licencia del modelo base (no disponible).
- Evaluación comparativa de cuantizaciones: el repositorio ofrece un espectro de cuantizaciones (de Q2_K a F16) útil para medir la degradación de calidad frente al tamaño en un modelo pequeño, aunque los resultados deben obtenerse mediante pruebas propias.
- Pipelines de CI para validación de modelos: el formato GGUF y la variedad de cuantizaciones permiten automatizar pruebas de carga y latencia en entornos de integración continua antes de desplegar el modelo base.
- Fine-tuning o destilación posteriores: si la licencia del modelo base lo permite (dato no disponible), los pesos podrían servir como punto de partida para ajustes específicos de dominio en tareas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, según el tamaño de 3,43B parámetros y el formato GGUF):
  - F16: en torno a 7 GB.
  - Q8_0: en torno a 3,6-4 GB.
  - Q6_K: en torno a 3 GB.
  - Q5_K_M / Q5_K_S: en torno a 2,5-2,8 GB.
  - Q4_K_M / Q4_K_S / IQ4_XS: en torno a 2-2,3 GB.
  - Q3_K_L / Q3_K_M / Q3_K_S: en torno a 1,6-2 GB.
  - Q2_K: en torno a 1,3-1,5 GB.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cualquier GPU con 4 GB o más de VRAM debería poder cargar las cuantizaciones de 4 bits, y las de 8 bits o F16 requieren 8 GB o más.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 4-8 GB de VRAM para cuantizaciones de 4-6 bits; las cuantizaciones de 2-3 bits podrían ejecutarse incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. No consta soporte específico de vLLM o TGI en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente sobre el modelo base (arquitectura, contexto, licencia, rendimiento) para establecer una comparativa fiable con alternativas de la misma categoría. Se indica "no disponible".

## Limitaciones y advertencias

- La model card no especifica la licencia del modelo base; no se puede confirmar el uso comercial sin consultar el repositorio `guillaume7/Rosa_v1_3.43B`.
- No hay información sobre sesgos, riesgo de alucinación o limitaciones idiomáticas del modelo.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad en un modelo de solo 3,43B parámetros; se recomienda validar con Q4_K_M o superior.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que no aporta señal sobre su validación por la comunidad.
- No se han publicado benchmarks ni evaluaciones independientes; cualquier uso en producción requiere una evaluación propia previa.
- El proceso de conversión se realizó con `quantize_version: 2`; conviene verificar la compatibilidad con la versión de llama.cpp utilizada.

## Enlaces

- Repositorio de cuantización: https://huggingface.co/mradermacher/Rosa_v1_3.43B-GGUF
- Modelo base: https://huggingface.co/guillaume7/Rosa_v1_3.43B
