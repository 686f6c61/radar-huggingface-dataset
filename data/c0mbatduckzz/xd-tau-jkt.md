# c0mbatduckzz/XD-TAU-JKT

## Resumen

XD-TAU-JKT no es un modelo de lenguaje entrenado, sino un repositorio que preserva la especificación arquitectónica XD-TAU v1.5 (13 de octubre de 2026), obra de Tom Klootwijk. El documento describe una arquitectura integrada de geometría, física e información que conecta entidades direccionables, geometría implícita y campos físicos e informativos en evolución mediante un estado compartido. La versión 1.5 amplía la "Binary-Spherical Organogram Architecture" con geometría constructiva, dinámica de materiales, transporte, control, grafos, codificación y espaciotiempo.

El repositorio contiene únicamente un PDF de 71 páginas con 18 adjuntos incrustados (ocho scripts de referencia/comprobación en Python y diez registros JSON de resultados y auditoría). El propio autor indica explícitamente que no contiene pesos de modelo entrenados ni servicio de inferencia alojado, y que los resultados y registros de verificación son los reportados en el documento, sin validación independiente por parte de la plataforma.

Por tanto, esta ficha documenta un artefacto de investigación arquitectónica, no un modelo desplegable. No hay parámetros, contexto, tokenizador, dataset de entrenamiento ni benchmarks de aprendizaje automático que evaluar. Se trata de una edición "legacy" que remite a la especificación actual XD-TAU 3.6 DWKT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Especificación arquitectónica (Binary-Spherical Organogram Architecture ampliada); no es un modelo neuronal entrenado |
| Parametros totales | no disponible (no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | proprietary-all-rights-reserved (license: other; sin concesión de derechos adicionales) |
| Formato de pesos | no disponible; el repositorio contiene un PDF (71 páginas) con adjuntos Python y JSON incrustados |
| Tamano del repositorio | 0.0 GB (según Hugging Face) |
| Autor | Tom Klootwijk (identificadores personales declarados: NL200678942 · 10-07-1990) |
| Versión | 1.5, 13 de octubre de 2026 |
| Fecha de creación del repo | 2026-10-14 |
| Última actualización | 2026-11-09 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no describe un transformer, MoE, SSM ni arquitectura híbrida de aprendizaje automático. XD-TAU se presenta como una especificación arquitectónica que integra geometría constructiva, dinámica de materiales, transporte, control, grafos, codificación y espaciotiempo sobre una "Binary-Spherical Organogram Architecture" y un estado compartido entre entidades direccionables, geometría implícita y campos físicos e informativos.

No se dispone de datos sobre corpus de entrenamiento, número de tokens, composición del dataset, RLHF, DPO ni ninguna otra técnica de alineación. El repositorio incluye ocho scripts Python de referencia/comprobación y diez registros JSON de resultados y auditoría como adjuntos del PDF, pero la plataforma no valida de forma independiente dichos resultados. El PDF se conserva sin modificaciones respecto al original, con SHA-256 `8dfae654435c035beefc3f9770cf6f51b55c0cef968071900142e4cf9b1cf0fd`.

## Capacidades

- No es un modelo de generación de texto: no hay pesos, tokenizador ni pipeline de inferencia.
- No soporta tool calling ni function calling en el sentido de un LLM desplegable.
- No soporta agentes ni razonamiento multi-paso mediante inferencia neuronal.
- Idioma declarado: inglés (en), referido a la documentación.
- Capacidad documental: preserva una especificación arquitectónica de 71 páginas con adjuntos de referencia en Python y JSON.
- Capacidad de verificación: incluye registros de auditoría reportados por el autor, no validados de forma independiente.

## Casos de uso

- Estudio de arquitecturas de investigación: lectura y análisis de la especificación XD-TAU v1.5 para investigadores interesados en geometría implícita, campos físicos e información y organogramas binario-esféricos.
- Auditoría documental: verificación de la integridad del PDF mediante el hash SHA-256 publicado y revisión de los adjuntos JSON de auditoría.
- Reproducción de scripts de referencia: extracción y ejecución de los ocho scripts Python incrustados en el PDF para comprobar los resultados reportados por el autor.
- Comparación de versiones: contraste de la edición legacy v1.5 con la especificación actual XD-TAU 3.6 DWKT para trazar la evolución del paradigma.
- Archivado y preservación: conservación del documento original sin modificaciones como referencia histórica de la línea XD-TAU.
- Análisis de licenciamiento: examen de la reserva de derechos, la reserva de minería de texto y datos (TDM) y las excepciones obligatorias aplicables antes de cualquier reutilización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas equivalentes, y no contiene pesos que puedan evaluarse.

## Requisitos de hardware

- VRAM para inferencia: no aplica; no hay pesos ni servicio de inferencia.
- GPU recomendadas: no disponible.
- Ejecución en GPU de consumo: no aplica.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplica.
- Latencia y throughput: no disponible.
- Requisito real: un lector de PDF con soporte de adjuntos incrustados para acceder a los scripts Python y registros JSON.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XD-TAU-JKT | Especificación arquitectónica (sin pesos) | no disponible | no disponible | proprietary-all-rights-reserved | PDF en Hugging Face |
| XD-TAU 3.6 DWKT | Especificación arquitectónica (edición actual) | no disponible | no disponible | no disponible en la información proporcionada | PDF en Hugging Face |
| Modelos LLM de referencia (p. ej. familias abiertas tipo Llama, Mistral, Qwen) | Modelos neuronales entrenados | miles de millones | decenas de miles de tokens | licencias abiertas o comunitarias | pesos y pipelines de inferencia |

La comparación con modelos de lenguaje no es homogénea: XD-TAU-JKT no es un modelo entrenado y no ofrece pesos, contexto ni rendimiento medible en tareas de NLP. La única comparación directa posible es con otras ediciones de la propia línea XD-TAU.

## Limitaciones y advertencias

- No contiene pesos de modelo ni servicio de inferencia; no puede utilizarse para generar texto, código ni razonamiento.
- Los resultados y registros de verificación son los reportados por el autor y no han sido validados de forma independiente por la plataforma.
- Licencia propietaria con todos los derechos reservados: no se concede permiso adicional para uso comercial, redistribución ni obra derivada.
- Reserva explícita de minería de texto y datos (TDM-RESERVATION.json), sujeta a excepciones obligatorias y a los términos de Hugging Face.
- Idioma de la documentación limitado al inglés.
- Edición legacy: el autor remite a la especificación actual XD-TAU 3.6 DWKT, por lo que esta versión puede quedar desactualizada.
- Sin descargas ni interacciones registradas (0 descargas, 0 likes), lo que impide evaluar adopción o revisión por la comunidad.
- Ausencia total de benchmarks y de datos de entrenamiento impide cualquier evaluación comparativa de rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/c0mbatduckzz/XD-TAU-JKT
- Especificación completa (PDF, 71 páginas): https://huggingface.co/c0mbatduckzz/XD-TAU-JKT/resolve/main/Tom_Klootwijk_XD-TAU_Architectural_Paradigm_v1.5_Complete_Specification.pdf
- Edición actual XD-TAU 3.6 DWKT: https://huggingface.co/c0mbatduckzz/XD-TAU-v3.6-DWKT
- Ediciones completas y condensadas DWKT: https://huggingface.co/c0mbatduckzz/XD-TAU-v3.6.3.6-DWKT
- Licencia (LICENSE): https://huggingface.co/c0mbatduckzz/XD-TAU-JKT/blob/main/LICENSE
- Reserva de minería de texto y datos (TDM-RESERVATION.json): https://huggingface.co/c0mbatduckzz/XD-TAU-JKT/blob/main/TDM-RESERVATION.json
- Términos de servicio de Hugging Face: https://huggingface.co/terms-of-service
