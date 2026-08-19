# mradermacher/Llama-3.3-MagicalGirl-2.5-GGUF

## Resumen

Llama-3.3-MagicalGirl-2.5-GGUF es una colección de cuantizaciones GGUF del modelo Llama-3.3-MagicalGirl-2.5, un merge creado por el usuario KaraKaraWarehouse y posteriormente cuantizado por mradermacher para facilitar su ejecución en hardware local. El modelo base es un merge de arquitectura transformer basado en Llama 3.3, con aproximadamente 70 550 millones de parámetros, lo que lo sitúa en la categoría de modelos grandes de alto rendimiento. Esta versión GGUF está pensada para desarrolladores que desean desplegar el modelo en entornos con recursos limitados, ofreciendo distintos niveles de cuantización que equilibran calidad y consumo de memoria.

La relevancia de este repositorio radica en que proporciona acceso directo a un modelo de 70B en formato GGUF, compatible con herramientas como llama.cpp, Ollama o LM Studio, sin necesidad de convertir los pesos manualmente. Al ser un merge, el modelo combina capacidades de varios modelos base, aunque no se especifican los componentes exactos del merge. La licencia no está indicada, lo que supone una limitación importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama 3.3, merge mediante mergekit) |
| Parametros totales | 70 553 706 560 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (presumiblemente 128k si hereda de Llama 3.3, sin confirmar) |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (segun etiqueta "en") |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Llama-3.3-MagicalGirl-2.5 es un merge creado con mergekit, una herramienta que combina varios modelos transformer mediante técnicas como interpolación de pesos o composición de capas. No se han publicado detalles sobre qué modelos se fusionaron ni la metodología exacta empleada. Dado que se basa en Llama 3.3, se espera que herede la arquitectura de transformer denso con atención multi-cabeza y normalización RMS, aunque no hay confirmación oficial.

No se dispone de información sobre el proceso de entrenamiento, el volumen de datos utilizado, ni si se aplicaron técnicas de alineación como RLHF o DPO. Al ser un merge, no se entrenó desde cero, sino que se combinaron pesos de modelos ya existentes. La cuantización GGUF realizada por mradermacher es estática, lo que significa que los pesos se convirtieron a baja precisión sin calibración adicional, a diferencia de la versión i1-GGUF que usa imatrix.

## Capacidades

- Generacion de texto conversacional: el modelo está etiquetado como "conversational", por lo que es adecuado para mantener diálogos multi-turno.
- Razonamiento y comprensión del lenguaje: al ser un modelo de 70B, se espera un buen desempeño en tareas de razonamiento, aunque no hay benchmarks que lo confirmen.
- Soporte de tool calling: no disponible en la información proporcionada.
- Capacidades multilingues: solo se indica inglés, aunque el modelo base podría soportar otros idiomas si hereda el vocabulario de Llama 3.3.
- No se mencionan capacidades de visión, audio ni modo de pensamiento.

## Casos de uso

- Asistentes conversacionales locales: el modelo puede integrarse en aplicaciones de chat mediante llama.cpp o Ollama, aprovechando las cuantizaciones Q4_K_M o Q5_K_M para un equilibrio entre calidad y uso de memoria.
- Generación de contenido creativo: su tamaño y naturaleza conversacional lo hacen útil para redactar textos largos, historias o guiones, aunque sin confirmación de calidad específica.
- Análisis de documentos extensos: si la longitud de contexto es de 128k (heredada de Llama 3.3), podría procesar documentos largos, pero esto no está verificado.
- Desarrollo de prototipos en entornos sin GPU potente: las cuantizaciones Q3_K_M o Q2_K permiten ejecutar el modelo en GPUs de 24 GB o incluso en CPU con suficiente RAM.
- Investigación académica sobre merges: sirve como ejemplo de un merge de 70B cuantizado, útil para estudiar el impacto de la cuantización en modelos fusionados.
- Evaluación comparativa de cuantizaciones: los distintos quants permiten medir la degradación de calidad frente al modelo original en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval ni otras evaluaciones estándar. Tampoco hay comparaciones con el modelo original o con otras cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia:
  - Q2_K (26.5 GB): cabe en una RTX 3090/4090 de 24 GB con offloading parcial, o en GPUs de 32 GB como A6000.
  - Q4_K_M (42.6 GB): requiere al menos 48 GB de VRAM (A6000, A100 40GB con ajustes, o 2x RTX 3090 en paralelo).
  - Q8_0 (75.1 GB): necesita GPUs de 80 GB como A100 o H100, o múltiples GPUs.
- GPU recomendadas: para uso local con Q4_K_M, una NVIDIA RTX A6000 (48 GB) es adecuada; para Q8_0, se necesitan soluciones multi-GPU o servidores dedicados.
- Compatibilidad con consumer GPU: solo las cuantizaciones más bajas (Q2_K, Q3_K) caben en GPUs de 24 GB, pero con pérdida de calidad notable.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier backend compatible con GGUF.
- Latencia y throughput: no se han publicado datos; dependerá del hardware y de la cuantización elegida.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo base es un merge sin documentación, por lo que no se conocen sus características exactas frente a Llama 3.3 70B original u otros merges similares como Llama-3.3-70B-Instruct. Se recomienda consultar el repositorio de KaraKaraWarehouse para obtener más detalles, aunque no se ha encontrado documentación adicional.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial es arriesgado sin conocer los términos de la licencia del modelo base y de los modelos fusionados.
- Falta de documentación: no hay información sobre el proceso de merge, los componentes utilizados ni la metodología de entrenamiento, lo que dificulta predecir su comportamiento.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos desconocidos: al ser un merge sin evaluación, no se conocen los sesgos presentes ni su mitigación.
- Calidad variable según cuantización: las cuantizaciones bajas (Q2_K, Q3_K) degradan significativamente la calidad y pueden producir incoherencias.
- Compatibilidad limitada a inglés: aunque el modelo base podría soportar otros idiomas, no está confirmado y el rendimiento en español podría ser inferior.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama-3.3-MagicalGirl-2.5-GGUF
- Modelo base: https://huggingface.co/KaraKaraWarehouse/Llama-3.3-MagicalGirl-2.5
- Versión con imatrix: https://huggingface.co/mradermacher/Llama-3.3-MagicalGirl-2.5-i1-GGUF
- Guía de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
