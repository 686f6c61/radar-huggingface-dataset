# Psalms23Wave/alkebulan-katonyeze

## Resumen

Alkebulan Katonyezeze es una familia de modelos de lenguaje para luganda (idioma bantú de Uganda, código ISO `lg`) publicada por Mathew Sekanjako bajo el sello Psalms23Wave LLC. No se trata de un único modelo, sino de una línea de cuatro iteraciones documentadas (Emu, Bbiri, Ssatu y Nnya), cada una con su propia entrada y métricas. El repositorio principal actúa como registro central de la serie y no contiene pesos descargables (tamaño del repo: 0,0 GB).

La propuesta técnica se apoya en dos piezas propias del autor: ABLT, un tokenizador que segmenta las palabras luganda según su estructura gramatical (prefijo de clase nominal, marcador de sujeto, tiempo, raíz y extensión) antes de aplicar fusiones estadísticas, y Sekan, un optimizador cuyo update rule no está publicado. La serie va desde un transformer pequeño entrenado desde cero (Emu, 1,7 M de parámetros) hasta un ajuste de Qwen3 0.6B adaptado al luganda mediante ABLT (Ssatu, 447,6 M de parámetros).

El interés actual reside en que documenta con rigor estadístico (múltiples semillas, errores estándar, conjuntos held-out) el proceso de adaptación de un modelo multilingüe a un idioma de bajos recursos, incluyendo el fenómeno de olvido catastrófico y la transferencia de conocimiento entre idiomas. Es material relevante para investigadores en lenguas africanas y para quienes evalúan tokenizadores morfológicamente informados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Emu y Bbiri desde cero; Ssatu y Nnya basados en Qwen3 0.6B) |
| Parámetros totales | Emu: 1.695.232; Bbiri: 4.977.152; Ssatu: 447.597.568; Nnya: en desarrollo |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Emu: ventana de 64 piezas ABLT; resto: no disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Luganda (`lg`); Ssatu pierde capacidad en inglés tras el ajuste |
| Licencia | No disponible en el repositorio principal; Qwen3 0.6B base es Apache 2.0 |
| Formato de pesos | No disponible (repo principal sin pesos; entradas individuales no verificadas) |

## Arquitectura y entrenamiento

Emu es un transformer de cuatro capas, anchura 128, cuatro cabezas de atención y ventana de 64 piezas sobre un vocabulario ABLT 2.0 de 6.981 piezas, entrenado con Sekan en un portátil en unos 75 segundos. Bbiri mantiene el diseño con anchura 256 y cuatro capas, y se entrenó con cinco semillas por configuración, seleccionando la tasa de aprendizaje en una semilla no reportada. Ssatu parte de Qwen3 0.6B (Apache 2.0) y lo adapta al luganda mediante ABLT 2.1 con un procedimiento interno no especificado; el entrenamiento completo duró 84 minutos en un Apple M1 Pro. Nnya, aún en curso, explora si un modelo que ya contiene hechos en inglés puede usarlos en luganda sin reentrenarlos, conectando Qwen3 0.6B a ABLT mediante un método interno del autor.

El tokenizador ABLT es la innovación central y está disponible como paquete (`pip install ablt`) y como modelo independiente (`Psalms23Wave/ablt-luganda`). Los resultados reportados indican que ABLT 2.1 lee texto held-out mejor que ABLT 2.0 tanto con Sekan (0,0039 bits de mejora, error estándar 0,0012) como con AdamW (0,0035, error 0,0004). La comparación entre Sekan y AdamW no arroja diferencias confirmadas: en ABLT 2.1, AdamW es inferior en 0,0018 bits con error estándar 0,0012, dentro del ruido estadístico, aunque Sekan muestra menor varianza entre semillas (0,0004 frente a 0,0008). En todas las ejecuciones el mejor paso fue el último, lo que sugiere que los modelos seguían aprendiendo al detenerse el entrenamiento.

## Capacidades

- Generación de texto en luganda: Emu produjo sus primeras frases en luganda el mismo día de su entrenamiento.
- Modelado de lenguaje medido en bits por carácter sobre conjuntos held-out.
- Concordancia de clase nominal: Ssatu alcanza un 98,8 % en 1.314 pares mínimos, frente al 55,6 % de Qwen3 0.6B sin ajustar.
- Escritura conforme a un limpiador de laboratorio: el 100 % de las líneas de Ssatu pasan el filtro, frente al 53 % de Qwen3 sin tocar.
- Traducción luganda-inglés en Nnya sin entrenamiento: chrF 35,7 con el método interno frente a 8,9 con el estándar.
- Respuesta a preguntas de opción múltiple en luganda: Nnya sin entrenar acierta el 53,4 % de 148 hechos con el método interno.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking.

## Casos de uso

- Investigación en tokenización morfológica: ABLT permite comparar segmentaciones gramaticales frente a BPE estándar en luganda, usando los bits por carácter como métrica objetiva de calidad de tokenizador.
- Evaluación de optimizadores en lenguas de bajos recursos: la serie Bbiri, con cinco semillas por configuración, sirve como banco de pruebas reproducible para comparar Sekan y AdamW con errores estándar explícitos.
- Adaptación de modelos multilingües a idiomas bantúes: Ssatu documenta el procedimiento y el coste (84 minutos en M1 Pro) de especializar Qwen3 0.6B en luganda, útil como referencia para equipos con hardware modesto.
- Estudio de olvido catastrófico: la caída de Ssatu en inglés y su 31,1 % en hechos (frente al 25 % del azar) ofrecen un caso medido de pérdida de capacidades tras el ajuste.
- Traducción luganda-inglés asistida: el chrF 35,7 de Nnya sin entrenamiento indica viabilidad de pipelines de traducción de bajo coste para este par de idiomas.
- Generación de texto educativo en luganda: Emu, con 1,7 M de parámetros y entrenamiento en 75 segundos, es adecuado para experimentos docentes de modelado de lenguaje desde cero.
- Evaluación de concordancia gramatical: el conjunto de 1.314 pares mínimos permite medir concordancia de clase nominal en sistemas de PLN para luganda.

## Benchmarks y rendimiento

| Métrica | Emu | Bbiri | Ssatu | Qwen3 0.6B sin tocar |
|---|---|---|---|---|
| Bits por carácter held-out | 1,5055 | 1,3704 ± 0,0004 | 1,6468 | 4,2567 |
| Lectura (media de 11 tipos de texto) | no disponible | no disponible | 1,744 | 3,957 |
| Concordancia de clase nominal (1.314 pares) | no disponible | no disponible | 98,8 % | 55,6 % |
| Líneas que pasan el limpiador | no disponible | no disponible | 100 % | 53 % |

| Métrica (Nnya, sin entrenar) | Método interno | Método estándar |
|---|---|---|
| Hechos acertados con pregunta en luganda | 53,4 % | 35,8 % |
| Hechos con respuesta distinta entre idiomas (112) | 58,9 % | 34,8 % |
| chrF luganda-inglés | 35,7 | 8,9 |

El autor advierte que las columnas de Emu, Bbiri y Ssatu no son comparables entre sí: cada modelo se evaluó sobre el conjunto held-out de su propia ronda, y el de Ssatu incluye tipos de texto más difíciles.

## Requisitos de hardware

- Emu (1,7 M de parámetros): entrenamiento e inferencia en CPU de portátil; entrenamiento en unos 75 segundos.
- Bbiri (5,0 M de parámetros): cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- Ssatu (447,6 M de parámetros): entrenamiento completo en 84 minutos en un Apple M1 Pro; inferencia viable en GPU consumer de gama media con cuantización, aunque no se publican requisitos exactos de VRAM.
- Nnya: en desarrollo; requisitos no disponibles.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no documentadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| Alkebulan Katonyeze Ssatu | 447,6 M | no disponible | Ajuste de Qwen3 0.6B a luganda con ABLT | no disponible |
| Qwen3 0.6B | 0,6 B | no disponible en la información | Modelo multilingüe generalista | Apache 2.0 |
| Alkebulan Katonyeze Emu | 1,7 M | 64 piezas ABLT | Transformer pequeño desde cero | no disponible |
| Alkebulan Katonyeze Bbiri | 5,0 M | no disponible | Transformer pequeño con cinco semillas | no disponible |

No se dispone de comparación con otros modelos especializados en luganda en la información proporcionada.

## Limitaciones y advertencias

- Ssatu no transfiere el conocimiento de Qwen al luganda: obtiene un 31,1 % en 148 hechos que Qwen responde correctamente en inglés, apenas por encima del 25 % del azar.
- Ssatu deja de leer inglés tras el ajuste, lo que lo inhabilita para uso bilingüe sin un pipeline separado.
- El optimizador Sekan tiene una regla de actualización no publicada, lo que impide reproducir exactamente el entrenamiento.
- La comparación entre Sekan y AdamW no muestra diferencias estadísticamente confirmadas en los experimentos publicados.
- Las puntuaciones de Emu, Bbiri y Ssatu no son comparables entre sí por usar conjuntos held-out distintos.
- En Nnya, el entrenamiento mejora la lectura (de 6,60 a 2,45 bits por carácter) pero degrada la comprensión de preguntas en luganda en 19,6 puntos, un caso documentado de deriva.
- La licencia del repositorio principal y de los modelos derivados no está especificada, lo que impide confirmar el uso comercial.
- El repositorio principal no contiene pesos (0,0 GB); los modelos deben obtenerse en sus entradas individuales.
- No se documentan sesgos, riesgos de alucinación específicos ni evaluaciones de seguridad.
- El idioma soportado es exclusivamente luganda; no hay cobertura multilingüe más allá de la base Qwen en Ssatu.

## Enlaces

- Repositorio principal: https://huggingface.co/Psalms23Wave/alkebulan-katonyeze
- Tokenizador ABLT: https://huggingface.co/Psalms23Wave/ablt-luganda
- Katonyeze Emu (0.1): https://huggingface.co/Psalms23Wave/alkebulan-luganda-small-v0.1
- Sitio del autor: https://www.sekanjakomathew.com
- Paper de referencia (arXiv:1912.00582): https://arxiv.org/abs/1912.00582
- Paper de referencia (arXiv:1909.01066): https://arxiv.org/abs/1909.01066
- Paper de referencia (arXiv:2502.21228): https://arxiv.org/abs/2502.21228
- Paper de referencia (arXiv:2411.00640): https://arxiv.org/abs/2411.00640
- Paper de referencia (arXiv:2505.09388): https://arxiv.org/abs/2505.09388
