# mradermacher/Dark-Nexus-12B-v2.0-GGUF

## Resumen

Dark-Nexus-12B-v2.0-GGUF es la versión cuantizada en formato GGUF del modelo original Dark-Nexus-12B-v2.0, desarrollado por ReadyArt y cuantizado por mradermacher. Se trata de un modelo de lenguaje de 12.247 millones de parámetros orientado a tareas de conversación, roleplay y generación de contenido explícito, tal como reflejan las etiquetas de su repositorio (nsfw, explicit, roleplay, unaligned, dangerous, ERP). El modelo se distribuye exclusivamente en inglés y no se especifica una licencia concreta más allá de "other".

La cuantización en GGUF permite su ejecución en entornos de consumo general con recursos limitados, ofreciendo una amplia gama de precisiones que van desde Q2_K hasta Q8_0. Aunque el modelo base no publica detalles arquitectónicos completos, se sabe que utiliza la librería transformers y que el contexto parece ser de 33.000 tokens según fuentes externas, aunque no está confirmado en la documentación oficial. La relevancia de este modelo radica en su carácter desalineado y orientado a contenido para adultos, lo que lo sitúa en una categoría de uso muy específica y con implicaciones éticas y legales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (transformers, sin especificar) |
| Parametros totales | 12.247.782.400 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (según fuentes externas, 33K, sin confirmación) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Inglés |
| Licencia | Other (no especificada) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base. Se sabe que está basado en transformers y que tiene 12.247 millones de parámetros, pero no se indica si se trata de una arquitectura tipo Llama, Mistral u otra. Tampoco se proporcionan datos sobre el dataset de entrenamiento, el número de tokens utilizados ni el proceso de alineación (RLHF, DPO, etc.). El modelo se presenta como "unaligned" y "dangerous", lo que sugiere que no ha sido sometido a técnicas de alineación con valores humanos y que puede generar contenido sin restricciones.

La cuantización realizada por mradermacher convierte los pesos originales a formato GGUF, optimizado para inferencia en CPU y GPU mediante librerías como llama.cpp o vLLM. No se ha publicado información sobre técnicas de entrenamiento innovadoras ni sobre el proceso de cuantización más allá de la conversión estándar.

## Capacidades

- Generación de texto libre en inglés, con especial énfasis en conversación y roleplay.
- Soporte de contenido explícito y temáticas para adultos, sin restricciones de contenido.
- Capacidad de mantener diálogos multi-turno en escenarios de rol y personajes.
- No se han documentado capacidades de tool calling, function calling o agentes.
- No se indica soporte de visión, audio u otras modalidades.
- Capacidades multilingües no disponibles; el modelo solo opera en inglés.

## Casos de uso

- Roleplay y creación de personajes: el modelo puede mantener conversaciones prolongadas con personalidades definidas, ideal para usuarios de plataformas de chat y juegos de rol.
- Generación de narrativa erótica o de ficción adulta: puede producir historias y diálogos con contenido explícito, adecuado para escritores creativos en ese género.
- Prototipado de chatbots de entretenimiento sin moderación: útil para desarrolladores que quieren probar sistemas de conversación sin filtros en entornos controlados.
- Investigación sobre alineación y seguridad: permite estudiar el comportamiento de modelos desalineados para entender riesgos y desarrollar métodos de mitigación.
- Simulación de conversaciones en entornos de investigación: puede usarse para generar datos sintéticos en estudios sobre comportamiento de modelos no supervisados.
- Evaluación de técnicas de cuantización: al estar disponible en múltiples precisiones, sirve para comparar la degradación de calidad entre distintos niveles de cuantización en tareas de generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: según el tamaño del archivo GGUF, se puede estimar:
  - Q2_K (4.9 GB): puede caber en una GPU con 6 GB de VRAM, como una GTX 1660 o RTX 2060.
  - Q4_K_M (7.6 GB): necesita al menos 8 GB de VRAM, como una RTX 3070 o RTX 4060.
  - Q8_0 (13.1 GB): requiere 16 GB de VRAM, como una RTX 4080 o RTX 4090.
- GPU recomendadas: para las versiones más ligeras, GPUs de gama media como RTX 3060 o RTX 4060 son suficientes; para las más pesadas, RTX 3090 o RTX 4090.
- En CPU: es posible ejecutar las versiones Q2_K y Q3_K con un rendimiento aceptable en procesadores modernos, pero no se recomienda para uso interactivo.
- Opciones de despliegue: se puede usar con llama.cpp, Ollama, vLLM (si se convierte a otro formato), o TGI, aunque el formato GGUF está optimizado para llama.cpp.
- Latencia y throughput: no se disponen de mediciones oficiales, pero en una GPU de 24 GB se puede esperar una generación de unos 10-20 tokens por segundo con Q4_K_M.

## Comparativa con modelos similares

No se ha identificado información sobre modelos directamente comparables en la misma categoría (12B, desalineado, GGUF). La comparativa no está disponible.

## Limitaciones y advertencias

- Contenido explícito y sin restricciones: el modelo está diseñado para generar contenido NSFW, erótico y potencialmente peligroso, lo que puede resultar ofensivo o inapropiado en contextos profesionales.
- Riesgo de alucinación: al no estar alineado, es probable que genere información falsa o inventada con mayor frecuencia que los modelos supervisados.
- Sin moderación: no se ha implementado ningún mecanismo de filtrado, lo que puede producir respuestas dañinas, ilegales o inmorales.
- Licencia no definida: la licencia "other" no especifica términos de uso comercial, por lo que no se garantiza su legalidad en aplicaciones comerciales.
- Idioma único: solo soporta inglés, limitando su uso en entornos multilingües.
- Contexto no confirmado: aunque se menciona un contexto de 33K en fuentes externas, no está documentado oficialmente, lo que puede llevar a errores en aplicaciones que requieran ventanas largas.
- No apto para producción: su naturaleza desalineada y su falta de documentación técnica lo hacen inadecuado para sistemas en producción que requieran seguridad y confiabilidad.

## Enlaces

- [Modelo GGUF en Hugging Face](https://huggingface.co/mradermacher/Dark-Nexus-12B-v2.0-GGUF)
- [Modelo base de ReadyArt](https://huggingface.co/ReadyArt/Dark-Nexus-12B-v2.0)
- [Referencia en Antbase](https://antbase.ai/models/dark-nexus-12b-v2-0) (fuente externa, no oficial)
