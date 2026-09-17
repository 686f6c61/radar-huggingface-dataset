# mradermacher/GLM-4.7-Flash-Name-NSFW-GGUF

## Resumen

Este repositorio contiene una colección de cuantizaciones GGUF del modelo `2048lr/GLM-4.7-Flash-Name-NSFW`, un ajuste fino de tipo NSFW derivado de la familia GLM-4.7-Flash. El trabajo de cuantización lo firma mradermacher, un autor conocido en HuggingFace por publicar versiones GGUF de centenares de modelos, mientras que el modelo original lo publica el usuario `2048lr`. El resultado es un modelo de aproximadamente 29.943.393.920 parámetros (unos 29,9 mil millones) que puede ejecutarse en hardware de consumo mediante llama.cpp y derivados, sin necesidad de infraestructura de servidor.

El problema que resuelve es doble: por un lado, permite ejecutar localmente un modelo de ~30 B con licencia MIT y en formato GGUF, lo que facilita el despliegue en estaciones de trabajo con GPU única; por otro, está orientado explícitamente a contenido conversacional para adultos (etiqueta `not-for-all-audiences`), un nicho poco cubierto por los modelos generalistas con alineamiento restrictivo. El idioma declarado es únicamente el chino (`zh`), lo que limita su uso fuera de ese mercado.

La relevancia actual es acotada pero concreta: se trata de una cuantización recién publicada (creada el 17 de septiembre de 2026), con cero descargas y cero valoraciones en el momento de redactar esta ficha, y sin resultados de benchmarks publicados. Conviene tratarla como material experimental, no validado por la comunidad, y verificar su comportamiento antes de cualquier uso en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no se documenta en la información proporcionada) |
| Parámetros totales | 29.943.393.920 (~29,9 B) |
| Parámetros activos | no disponible (no se especifica si la arquitectura es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (los tags mencionan además IQ4_XS y x-f16) |
| Idiomas soportados | chino (`zh`) |
| Licencia | MIT |
| Formato de pesos | GGUF (el modelo base se distribuye en formato transformers/safetensors) |
| Autor de la cuantización | mradermacher |
| Modelo base | 2048lr/GLM-4.7-Flash-Name-NSFW |
| Tamaño del repositorio | 203,9 GB (suma de todas las variantes) |
| Versión de cuantización | quantize_version 2, output_tensor_quantised 1, convert_type hf |
| Librería declarada | transformers |
| Fecha de creación | 17 de septiembre de 2026 |
| Fecha de actualización | 17 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible no documenta la arquitectura interna del modelo: no se especifica si se trata de un transformer denso, de una mezcla de expertos (MoE) o de una arquitectura híbrida. Tampoco hay datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineamiento como RLHF o DPO. El único dato estructural fiable es el recuento de parámetros del modelo base (29.943.393.920), que sitúa al modelo en la franja de los 30 B, y su pertenencia a la familia GLM-4.7-Flash, de la que se desconoce la ficha técnica completa en esta información.

Lo que sí está documentado es el proceso de cuantización aplicado por mradermacher: cuantizaciones estáticas (no ponderadas por imatrix), con versión de cuantizador 2 y conversión de tipo `hf`. El autor indica explícitamente que las cuantizaciones ponderadas por imatrix no estaban disponibles en el momento de la publicación y que podrían no planificarse. La tabla de variantes va desde Q2_K (11,1 GB) hasta Q8_0 (31,9 GB), lo que abarca un rango amplio de compromisos entre tamaño, calidad y velocidad.

## Capacidades

- Conversación multi-turno en chino: la etiqueta `conversational` del repositorio y el idioma declarado (`zh`) indican un modelo afinado para diálogo.
- Generación de contenido NSFW: el nombre del modelo (`Name-NSFW`) y la etiqueta `not-for-all-audiences` señalan un ajuste orientado explícitamente a contenido para adultos, probablemente con especialización en dinámicas de rol y nombres propios de personajes.
- Ejecución local: al estar en formato GGUF, es compatible con llama.cpp y todo su ecosistema de inferencia en CPU y GPU.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el repositorio declara únicamente chino.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Roleplay y narrativa interactiva para adultos en chino: el modelo está ajustado específicamente para este dominio, por lo que puede mantener conversaciones de personaje con continuidad y control de nombres propios. Es adecuado porque evita las negativas típicas de los modelos alineados de propósito general.
- Despliegue local con privacidad estricta: al ejecutarse con llama.cpp u Ollama en hardware propio, ningún dato de la conversación sale de la máquina. Resulta apropiado para usuarios que no quieren enviar contenido sensible a APIs de terceros.
- Investigación en seguridad y alineación: sirve para generar material NSFW controlado y estudiar cómo se comportan los filtros de moderación, construir clasificadores de contenido o analizar la degradación del alineamiento tras un ajuste fino no restringido.
- Generación de datasets sintéticos para moderación: el modelo puede producir ejemplos etiquetados de texto para adultos que alimenten clasificadores de contenido en pipelines de moderación, siempre que se cumplan los requisitos legales aplicables.
- Evaluación de degradación por cuantización: al existir diez variantes de cuantización del mismo modelo (de Q2_K a Q8_0), permite medir empíricamente cuánta calidad se pierde a 2, 3, 4, 5, 6 y 8 bits sobre un caso de uso concreto, algo útil para calibrar qué variante desplegar.
- Chatbot de personaje con identidad fija: el ajuste centrado en nombres facilita mantener una persona concreta a lo largo de sesiones largas, útil en aplicaciones de acompañamiento conversacional en chino.
- Pruebas comparativas de cuantización en hardware modesto: permite validar si una GPU de 12 GB puede con la variante Q2_K (11,1 GB) y qué latencia se obtiene, como paso previo a decidir el hardware definitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

| Variante | Tamaño | VRAM aproximada necesaria | GPU recomendada |
|---|---|---|---|
| Q2_K | 11,1 GB | ~12 GB con contexto corto | RTX 3060 12 GB (ajustado), RTX 4070 Ti |
| Q3_K_S | 13,1 GB | ~14-15 GB | RTX 4080, RTX 4090 (con offload parcial si falta VRAM) |
| Q3_K_M | 14,5 GB | ~16 GB | RTX 4080 16 GB |
| Q3_K_L | 15,7 GB | ~17 GB | RTX 4080 16 GB, RTX 4090 |
| Q4_K_S | 17,2 GB | ~19 GB | RTX 4090 24 GB |
| Q4_K_M | 18,2 GB | ~20-21 GB | RTX 3090 / RTX 4090 24 GB |
| Q5_K_S | 20,8 GB | ~23 GB | RTX 3090 / RTX 4090 24 GB (contexto moderado) |
| Q5_K_M | 21,4 GB | ~24 GB | RTX 3090 / RTX 4090 24 GB (contexto corto) |
| Q6_K | 24,7 GB | ~27 GB | 2x RTX 3090, RTX 5090 32 GB |
| Q8_0 | 31,9 GB | ~34-36 GB | A100 40 GB, 2x RTX 4090, RTX 5090 32 GB (ajustado) |

- Cabe en GPU de consumo: sí. Las variantes Q2_K a Q4_K_M caben en tarjetas de 12 a 24 GB; Q5 y Q6 requieren 24 GB o más; Q8_0 necesita 32 GB o dos GPU.
- GPU profesionales: A100 40 GB, H100 80 GB, L40S 48 GB cubren cualquier variante con contexto amplio.
- Opciones de despliegue: llama.cpp (`llama-server`), Ollama, LM Studio, koboldcpp, text-generation-webui y `llama-cpp-python`. vLLM no es la vía natural para GGUF y no está documentada aquí.
- Latencia y throughput estimados: no disponible.
- Nota de almacenamiento: el repositorio completo ocupa 203,9 GB; conviene descargar solo la variante necesaria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/GLM-4.7-Flash-Name-NSFW-GGUF | 29,9 B | no disponible | MIT | GGUF | Cuantizaciones estáticas Q2_K-Q8_0; ajuste NSFW; solo chino |
| 2048lr/GLM-4.7-Flash-Name-NSFW (modelo base) | 29,9 B | no disponible | MIT | safetensors / transformers | Sin cuantizar; requiere más VRAM |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se han identificado modelos comparables en la información proporcionada |

No se dispone de datos de rendimiento ni de comparativas objetivas con otros modelos de 30 B; no se han inventado cifras.

## Limitaciones y advertencias

- Contenido NSFW explícito: el modelo está etiquetado como `not-for-all-audiences`; su uso debe restringirse a entornos adultos y cumplir la normativa aplicable en cada jurisdicción.
- Idioma único: solo se declara chino (`zh`). No hay evidencia de calidad en castellano ni en otros idiomas.
- Sin benchmarks publicados: no existe ninguna medición objetiva de calidad, razonamiento o seguridad, lo que impide estimar su rendimiento real.
- Sin validación de la comunidad: cero descargas y cero valoraciones en la fecha de creación, por lo que no hay retroalimentación de terceros sobre su comportamiento.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no hay datos específicos que lo cuantifiquen.
- Sesgos: no documentados en la información disponible; un ajuste fino NSFW sin alineamiento posterior puede amplificar estereotipos y comportamientos problemáticos.
- Degradación por cuantización: las variantes Q2_K y Q3_K_S, con 2 y 3 bits por peso, sufren pérdidas notables de calidad en modelos de ~30 B.
- Licencia MIT: permite uso comercial según los términos declarados, pero la legalidad del contenido generado depende del uso concreto y no de la licencia del modelo. Conviene revisar también las condiciones del modelo base.
- Ausencia de filtros: no se documenta ninguna capa de moderación integrada, por lo que cualquier salvaguarda debe implementarse en la aplicación que lo consume.
- Fecha de creación futura en los metadatos (17 de septiembre de 2026): conviene verificar la integridad y procedencia de los archivos antes de desplegarlos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/GLM-4.7-Flash-Name-NSFW-GGUF
- Modelo base: https://huggingface.co/2048lr/GLM-4.7-Flash-Name-NSFW
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#GLM-4.7-Flash-Name-NSFW-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfica comparativa de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH (empresa que cede recursos al cuantizador): https://www.nethype.de/
