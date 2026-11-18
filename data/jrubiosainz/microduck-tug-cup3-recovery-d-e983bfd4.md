# jrubiosainz/microduck-tug-cup3-recovery-d-e983bfd4

## Resumen

`jrubiosainz/microduck-tug-cup3-recovery-d-e983bfd4` es un artefacto ONNX de muy pequeño tamaño (1.003.410 bytes, aproximadamente 1 MB) publicado en Hugging Face por el usuario `jrubiosainz`. No se trata de un modelo de lenguaje en el sentido habitual, sino de una política de control para un entorno de simulación de competición (referido como "Cup3" y "tug"), empaquetada como grafo ONNX. El repositorio tiene 0 descargas y 0 likes, y un tamaño total de 0.0 GB según Hugging Face, lo que confirma que el peso real es el fichero ONNX de ~1 MB.

La model card es explícita: el modelo **no está publicado** ("NOT published"), está "staged unchanged" y requiere una autorización de publicación separada ("a separate publication GO is still required"). El autor describe el artefacto como un "source-only candidate" con un SHA256 de política (`e983bfd4…6360f3a0f`) y un replay local en x86 con media 168.90445351600647 sobre cinco semillas. Se advierte que no es un resultado oficial de servidor y que es solo para simulación, no para despliegue en robots físicos.

Por tanto, esta ficha documenta un artefacto de investigación de nicho, con información muy limitada y sin especificaciones de modelo de lenguaje (arquitectura, parámetros, contexto, idiomas). Todos los campos no cubiertos por la información disponible se marcan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (artefacto ONNX de política de control; no se describe arquitectura de red) |
| Parametros totales | no disponible (peso del fichero ONNX: 1.003.410 bytes) |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible ("No new licence is asserted" en la model card) |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

La información disponible no describe una arquitectura de transformer, MoE, SSM ni híbrida. El artefacto es un grafo ONNX que implementa una política de control ("controller") para un entorno de simulación. La model card menciona un "inherited D7/L1 controller" y "non-table initializers" que permanecen los de L5 según la comparación estática del propietario. Las semillas 1-2 conservan trayectorias de L5, las semillas 3-4 usan refinamientos propios y la semilla 5 acredita la trayectoria de la semilla 5 de `HlibPlakhtii/quicksilver-tug-rating-nov18-v1`. El controlador genérico v8 de Hlib, `cup_bias` y `switch` no están incluidos.

No se especifican datos de entrenamiento (número de tokens, composición del dataset), ni procesos de RLHF/DPO, ni innovaciones técnicas como decodificación especulativa o atención lineal. El autor reporta "zero changed-key hits on 307714 historical observations in 1744 archives", pero aclara que la igualdad finita es derivada, no un replay en bucle cerrado ni una equivalencia universal.

## Capacidades

- Ejecución de una política de control en formato ONNX para un entorno de simulación de competición ("tug", "Cup3").
- Replay determinista en x86: 347 pasos, todos ellos "lookup hits", con cero fallbacks, cero "bad hits" y cero valores no finitos, según la model card.
- Generación de una trayectoria de cinco semillas con vector `[169.02587413787842, 169.06843781471252, 168.470561504364, 169.41882371902466, 168.53857040405273]` y media 168.90445351600647.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes, multilingüismo ni modo "thinking".

## Casos de uso

- Replay de validación en x86: ejecutar el grafo ONNX con el receipt `x86-replay-receipt.json` para reproducir la media 168.90445351600647 y verificar los 347 pasos sin fallback.
- Auditoría de integridad: comprobar el SHA256 de política `e983bfd4628359cd58fc617d6b246a015ab1aef6b2fe2d4ac9faf5e6360f3a0f` y el tamaño de 1.003.410 bytes antes de cualquier uso.
- Sustitución de entrante en Cup3: el autor indica que COORD aceptó reemplazar a L5 como entrante actual de Cup3, aceptando el compromiso de recuperación de rating, no una mejora H2H.
- Comparación estática de controladores: usar la comparación del propietario sobre 307.714 observaciones históricas en 1.744 archivos para estudiar diferencias de claves.
- Investigación de transferencia sintética: el "synthetic transfer build/verdict" se describe como plan de replay, no como evidencia medida; sirve para diseñar experimentos, no para conclusiones.
- Estudio de linaje de políticas: analizar la herencia D7/L1 y las contribuciones por semilla (L5, refinamientos propios, semilla 5 de HlibPlakhtii) en un contexto académico de competición.

## Benchmarks y rendimiento

| Metrica | Resultado | Notas |
|---|---|---|
| Media de replay local x86 (5 semillas) | 168.90445351600647 | Vector `[169.02587413787842, 169.06843781471252, 168.470561504364, 169.41882371902466, 168.53857040405273]` |
| Semillas con `pit_won` | 5 de 5 | runner5/vx -0.3 |
| Recuentos de filas | 66/70/72/70/69 | Por semilla |
| Pasos totales | 347 | Todos lookup hits, cero fallback, cero bad hits, cero no finitos |
| Resultado oficial de servidor | no disponible | El autor indica que no es un resultado oficial |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el fichero ONNX pesa 1.003.410 bytes (~1 MB), por lo que la huella de memoria es mínima, pero no se documenta.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; por tamaño, cualquier GPU moderna podría alojarlo, pero no se confirma.
- Opciones de despliegue: ONNX Runtime (formato ONNX); no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `jrubiosainz/microduck-tug-cup3-recovery-d-e983bfd4` | no disponible (~1 MB ONNX) | no disponible | Media local x86 168.90445351600647 (5 semillas) | no disponible | Hugging Face, no publicado oficialmente |
| `HlibPlakhtii/quicksilver-tug-rating-nov18-v1` | no disponible | no disponible | no disponible (solo se cita su semilla 5) | no disponible | citado en la model card |
| L5 (controlador heredado) | no disponible | no disponible | no disponible | no disponible | citado en la model card |

No se dispone de datos suficientes para una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo **no está publicado**: la model card indica "NOT published" y requiere una autorización de publicación separada.
- Solo para simulación: "Simulation only, not for physical robot deployment".
- No es un resultado oficial de servidor; el replay x86 es local y el autor lo aclara explícitamente.
- La igualdad finita es derivada, no un replay en bucle cerrado, ni equivalencia universal, ni mejora H2H, ni victoria de copa.
- El "synthetic transfer build/verdict" es un plan de replay, no evidencia medida.
- No se afirma ninguna licencia nueva ("No new licence is asserted"), lo que impide determinar condiciones de uso comercial.
- No hay información sobre sesgos, alucinación, limitaciones de contexto o idioma porque no es un modelo de lenguaje.
- Los checks de copia pre-envío retienen "global completeness UNKNOWN".
- El score oficial, `copy_of` y `on_board` requieren una ejecución futura en servidor.

## Enlaces

- Hugging Face: https://huggingface.co/jrubiosainz/microduck-tug-cup3-recovery-d-e983bfd4
- Referencia citada en la model card: `HlibPlakhtii/quicksilver-tug-rating-nov18-v1` (no se proporciona URL directa en la información disponible)
- Fichero de receipt citado: `x86-replay-receipt.json` (no se proporciona URL directa)
- Paper, blog, repositorio o demo adicionales: no disponibles
