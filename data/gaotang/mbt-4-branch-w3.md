# gaotang/MBT-4-branch-W3

## Resumen

MBT-4-branch-W3 es un checkpoint de investigación de tipo "model-only" publicado por el usuario gaotang (GaotangLi) dentro de sus experimentos sobre Multi-Branch Transformer (MBT). Se trata de un transformer con arquitectura multi-rama y mezcla de expertos (MoE) bajo una asignación equilibrada de 4 ramas (4 / (4+4+4+4) / 4), en la escala interna denominada W3. El modelo tiene 1.420.583.168 parámetros reales según los tensores en safetensors y fue entrenado sobre 57.942.212.608 tokens con un contexto de 4.096 tokens.

Su relevancia es fundamentalmente académica: no es un modelo listo para producción ni para uso directo con las herramientas estándar. El propio autor indica que los pesos conservan los nombres de tensor nativos y los buffers de enrutamiento persistentes, y que la carga requiere la implementación nativa basada en Megatron correspondiente. No está en formato compatible con `AutoModel` de Transformers ni con vLLM, y la release no incluye un runtime de inferencia autónomo.

El checkpoint corresponde a la actualización de optimizador 55.258 y reporta una pérdida de validación fija de 2,454 sobre un conjunto held-out fijo de 12.160 secuencias. Está pensado para reproducir y auditar los experimentos de arquitectura MBT, no como base para aplicaciones finales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Multi-Branch Transformer (MBT) con mezcla de expertos, KV compartida entre ramas |
| Parámetros totales | 1.420.583.168 (1.420.583.168 en safetensors; la model card indica 1.420.583.168) |
| Parámetros activos | no disponible |
| Longitud de contexto | 4.096 tokens (contexto de entrenamiento) |
| Tipos de cuantización | no disponible (solo se publican pesos en safetensors sin cuantizar) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (`model.safetensors`, formato `mbt-native-shared-kv-v1`) |

## Arquitectura y entrenamiento

La arquitectura es un Multi-Branch Transformer con cuatro ramas y asignación equilibrada (4 / (4+4+4+4) / 4), combinada con mezcla de expertos y un esquema de KV compartida entre ramas ("Joint-KV"). El checkpoint pertenece a la escala W3 del proyecto y conserva los buffers de enrutamiento persistentes del MoE, lo que implica que el grafo de enrutamiento forma parte del estado exportado y debe respetarse al cargar los pesos. No se detalla en la información disponible el número de capas, dimensión oculta, número de expertos ni top-k de enrutamiento.

El entrenamiento cubrió 57.942.212.608 tokens con contexto de 4.096 tokens y alcanzó la actualización de optimizador 55.258. La validación se realizó sobre un conjunto fijo de 12.160 secuencias held-out, con una pérdida final de 2,454. No se especifica en la información proporcionada la composición del dataset, ni si hubo RLHF, DPO u otras fases de alineamiento. El checkpoint es "model-only": no incluye optimizador, estado de RNG, dataset de entrenamiento ni tokenizador; el tokenizador de Llama 3 debe obtenerse por separado bajo sus propios términos de acceso y licencia.

## Capacidades

- Generación de texto en inglés, según el `pipeline_tag` declarado (`text-generation`).
- Modelo de investigación orientado a estudiar arquitecturas multi-rama con MoE y KV compartida; no se documentan capacidades funcionales adicionales.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Reproducción de experimentos de arquitectura: cargar el checkpoint con la implementación nativa Megatron del proyecto MBT para verificar la pérdida de validación reportada (2,454) sobre el conjunto fijo de 12.160 secuencias.
- Investigación sobre MoE y KV compartida: analizar los buffers de enrutamiento persistentes para estudiar cómo se distribuye la carga entre las cuatro ramas y qué efecto tiene la KV compartida en el coste de atención.
- Estudio de asignación de ramas: comparar la configuración equilibrada 4/(4+4+4+4)/4 con otras asignaciones del proyecto para evaluar el impacto en pérdida y eficiencia.
- Auditoría de checkpoints nativos: usar los registros de validación adjuntos (fixtures, comparaciones y tolerancias) para validar procesos de exportación y recarga de pesos en pipelines de investigación.
- Base para ablaciones académicas: punto de partida para experimentos controlados sobre escala W3 con 57.942 millones de tokens de entrenamiento y contexto de 4.096 tokens.
- Verificación de integridad de artefactos: comprobar el SHA256 publicado de `model.safetensors` en pipelines de descarga reproducible con `revision=` fijado a un commit concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de evaluación reportado es la pérdida de validación fija de 2,454 sobre el conjunto held-out de 12.160 secuencias.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, 1.420.583.168 parámetros en safetensors ocupan aproximadamente 2,8 GB en el repositorio; en FP16 serían unos 2,8 GB y en FP32 unos 5,7 GB, sin contar buffers de enrutamiento ni estados de atención.
- GPU recomendadas: no disponible. El checkpoint no es compatible con vLLM ni con `AutoModel` estándar, por lo que las recomendaciones habituales de despliegue no aplican directamente.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de pesos en FP16 cabría en GPUs de consumo con suficiente VRAM, pero la falta de runtime estándar impide garantizar la ejecución.
- Opciones de despliegue: únicamente la implementación nativa basada en Megatron del proyecto Multi-Branch Transformer. No hay soporte documentado para llama.cpp, Ollama, TGI ni vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma familia MBT ni alternativas con arquitectura multi-rama y KV compartida publicadas con especificaciones verificables.

## Limitaciones y advertencias

- Checkpoint de investigación "model-only": no incluye tokenizador, runtime de inferencia ni scripts de carga estándar.
- No es compatible con `AutoModel` de Transformers ni con vLLM; requiere la implementación nativa Megatron del proyecto.
- Contexto de entrenamiento limitado a 4.096 tokens, insuficiente para casos de uso con documentos largos.
- Idioma restringido al inglés según la etiqueta de la model card.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribución.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al ser un modelo de investigación sin fases de alineamiento documentadas, no debe usarse en producción sin evaluación adicional.
- El tokenizador de Llama 3 debe obtenerse por separado y está sujeto a sus propios términos de acceso y licencia.
- Sin descargas ni likes en el momento de la consulta, lo que refleja un uso muy limitado y ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gaotang/MBT-4-branch-W3
- Proyecto Multi-Branch Transformer: https://github.com/GaotangLi/Multi-Branch-Transformer
