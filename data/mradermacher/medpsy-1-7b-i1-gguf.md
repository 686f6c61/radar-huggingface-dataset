# mradermacher/MedPsy-1.7B-i1-GGUF

## Resumen

MedPsy-1.7B-i1-GGUF es la version cuantizada en formato GGUF del modelo MedPsy-1.7B, un modelo de lenguaje especializado en dominio medico y sanitario desarrollado originalmente por el equipo qvac. Esta publicacion corre a cargo de mradermacher, un conocido cuantizador de la comunidad de Hugging Face que genera versiones optimizadas para inferencia local. El modelo base parte de la arquitectura Qwen3 y esta disenado explicitamente para despliegue en el borde (edge) y en dispositivos, segun las etiquetas de la model card.

El modelo resuelve el problema de disponer de un asistente clinico ligero que pueda ejecutarse en hardware modesto sin depender de la nube, algo relevante en entornos sanitarios con requisitos de privacidad. Con aproximadamente 2.030 millones de parametros (2,03 B), se situa en la categoria de modelos pequenos, lo que facilita su ejecucion en GPUs de consumo e incluso en CPU.

Esta version i1 incorpora cuantizaciones con imatrix (importance matrix), que mejoran la calidad respecto a las cuantizaciones estaticas tradicionales en el mismo tamano. El repositorio incluye un amplio abanico de niveles de cuantizacion, desde IQ1_S (0,7 GB) hasta Q6_K (1,8 GB), lo que permite ajustar el equilibrio entre calidad y consumo de recursos. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Qwen3) |
| Parametros totales | 2.031.739.904 (aprox. 2,03 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo base MedPsy-1.7B se construye sobre la arquitectura Qwen3, un transformer decoder-only. La informacion disponible no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset clinico ni si se aplicaron tecnicas de RLHF o DPO. Las etiquetas de la model card indican un enfoque en dominio medico, healthcare y clinical, con mencion a NeurIPS 2026 y a tether-ai, lo que sugiere una publicacion academica asociada, aunque los detalles no se recogen en la informacion proporcionada.

La innovacion principal de esta publicacion concreta es el uso de cuantizaciones i1 con imatrix (importance matrix), generadas a partir de un fichero imatrix incluido en el repositorio. Este enfoque permite obtener cuantizaciones de baja precision con mejor calidad que las estaticas equivalentes. El autor indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamano similar.

## Capacidades

- Generacion de texto conversacional orientada a dominio medico y sanitario.
- Respuesta a preguntas clinicas y de healthcare (segun etiquetas del modelo).
- Inferencia en dispositivo (on-device) y en el borde (edge), gracias a su tamano reducido.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: limitadas al ingles (en).
- Modo thinking, vision o audio: no disponible en la informacion.

## Casos de uso

- Asistente clinico en dispositivo: el modelo puede ejecutarse localmente en un portatil o estacion de trabajo sanitaria para responder consultas de apoyo, evitando enviar datos de pacientes a servicios en la nube y cumpliendo requisitos de privacidad.
- Triaje y orientacion inicial: con su ventana de contexto (no especificada) y su enfoque medico, puede gestionar conversaciones de primer contacto para clasificar sintomas y derivar al especialista adecuado.
- Formacion y simulacion clinica: util como generador de escenarios de practica o preguntas de repaso para estudiantes de medicina, ejecutandose en equipos de aula sin infraestructura dedicada.
- Documentacion clinica asistida: borradores de resumenes o notas a partir de texto introducido por el profesional, con la ventaja de que el procesamiento ocurre en local.
- Investigacion en NLP clinico: modelo pequeno y de licencia permisiva para experimentar con tecnicas de ajuste fino o evaluacion en tareas medicas sin grandes recursos de computo.
- Despliegue en entornos con hardware limitado: gracias a las cuantizaciones desde 0,7 GB, puede integrarse en aplicaciones de escritorio o moviles con llama.cpp u Ollama para asistencia sanitaria de bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB con cuantizaciones IQ2/IQ3, alrededor de 1,3-1,4 GB con Q4_K_S/Q4_K_M, y 1,8 GB con Q6_K (mas overhead de contexto).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son mas que suficientes. Tambien viable en A100/H100 para despliegues con muchas peticiones.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna de consumo, e incluso en iGPU y CPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con vLLM o TGI en formato safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MedPsy-1.7B (esta ficha) | 2,03 B | no disponible | Apache 2.0 | GGUF / safetensors | Especializado en dominio medico, orientado a edge |
| Qwen3-1.7B (base arquitectonica) | aprox. 1,7 B | no disponible en esta ficha | Apache 2.0 | safetensors / GGUF | Modelo generalista; MedPsy parte de esta familia |
| Otros modelos medicos pequenos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta ingles; no es adecuado para castellano u otros idiomas sin ajuste adicional.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion clinica incorrecta; no debe usarse como sustituto del criterio medico profesional.
- Sesgos conocidos: no documentados en la informacion disponible; cabe esperar sesgos derivados de los datos de entrenamiento clinicos.
- Longitud de contexto no especificada: limita la planificacion de casos con documentos largos.
- Las cuantizaciones de muy baja precision (IQ1_S, IQ1_M, Q2_K_S) degradan notablemente la calidad; el autor las describe como "for the desperate" o "very low quality".
- Uso comercial permitido por la licencia Apache 2.0, pero con la responsabilidad de validar el modelo en el dominio clinico antes de produccion.
- No apto para diagnostico autonomo ni para decisiones clinicas sin supervision humana.

## Enlaces

- Repositorio Hugging Face (esta version): https://huggingface.co/mradermacher/MedPsy-1.7B-i1-GGUF
- Modelo base: https://huggingface.co/qvac/MedPsy-1.7B
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/MedPsy-1.7B-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#MedPsy-1.7B-i1-GGUF
- Licencia del modelo base: https://huggingface.co/qvac/MedPsy-1.7B/blob/main/LICENSE
- Preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
