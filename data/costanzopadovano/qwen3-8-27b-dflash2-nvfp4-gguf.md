# costanzopadovano/Qwen3.8-27B-DFlash2-NVFP4-GGUF

## Resumen

El modelo `costanzopadovano/Qwen3.8-27B-DFlash2-NVFP4-GGUF` es una conversión experimental a formato GGUF con cuantización NVFP4 (punto flotante de 4 bits de NVIDIA) del modelo draft especulativo `z-lab/Qwen3.8-27B-DFlash2`. Este draft model, con aproximadamente 1,92 mil millones de parámetros, está diseñado para proponer tokens candidatos en esquemas de decodificación especulativa (speculative decoding) para el modelo objetivo Qwen3.8-27B, un denso de 27B parámetros con atención híbrida desarrollado por Alibaba. No es un modelo autónomo: su función es acelerar la inferencia del modelo grande reduciendo el número de pasos de decodificación.

La relevancia de este artefacto radica en su eficiencia de memoria: el archivo GGUF ocupa aproximadamente 1,02 GiB, un 46,8% menos que la versión Q8_0 del mismo draft y un 4,3% menos que la Q4_K_M. Esto permite ejecutar el draft model en GPUs de consumo con poca VRAM, liberando espacio para el modelo objetivo y su caché KV. Sin embargo, el modelo requiere un runtime experimental de llama.cpp (QVIR-1 R2) que soporte las opciones específicas de DFlash2, bounded-prefill, `ngram-mod` y dispatch NVFP4, por lo que no es compatible con builds estándar de llama.cpp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DFlash2 (draft model para decodificación especulativa) |
| Parametros totales | 1.924.404.480 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (perfil validado con contexto objetivo de 153.600 tokens) |
| Tipos de cuantizacion | NVFP4 (49 tensores NVFP4 + 32 tensores F32) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un draft model basado en la arquitectura DFlash2, diseñado específicamente para decodificación especulativa. Su función es generar secuencias cortas de tokens candidatos (hasta 4 tokens por paso según el perfil validado) que el modelo objetivo Qwen3.8-27B evalúa y acepta o rechaza. El modelo objetivo, Qwen3.8-27B, emplea una arquitectura de atención híbrida: de sus 64 capas, solo 16 utilizan atención completa (con intervalo de atención completa de 4), mientras que las 48 restantes usan atención lineal con estado recurrente constante. El draft model replica esta estructura a menor escala, aunque los detalles exactos de su arquitectura interna no están documentados en la información disponible.

No se dispone de datos sobre el entrenamiento del draft model (número de tokens, composición del dataset, uso de RLHF o DPO). El repositorio indica que los pesos fuente están fijados a una revisión concreta de `z-lab/Qwen3.8-27B-DFlash2` y que el hash SHA-256 del payload es idéntico en las revisiones públicas inspeccionadas. La conversión a NVFP4 es un proceso de cuantización post-entrenamiento, no un reentrenamiento.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: el modelo propone hasta 4 tokens por paso (configuración `--spec-draft-n-max 4`) que el modelo objetivo evalúa.
- Soporte de tool-trigger: el runtime QVIR-1 R2 incluye un fix específico para la activación de herramientas de Qwen3.8, lo que permite su uso en flujos agénticos.
- Integración con caché KV cuantizada: el perfil validado usa caché KV Q8_0 para el modelo objetivo, reduciendo aún más el consumo de VRAM.
- Compatibilidad con contexto largo: el perfil de validación utilizó un contexto objetivo de 153.600 tokens, lo que sugiere que el draft model puede operar en escenarios de ventana extendida.
- Eficiencia de memoria: la cuantización NVFP4 reduce el tamaño del draft a ~1,02 GiB, permitiendo su carga en GPUs con poca VRAM.

## Casos de uso

- Aceleración de inferencia de Qwen3.8-27B en GPUs de consumo: el draft model permite ejecutar el modelo objetivo de 27B en hardware con VRAM limitada (por ejemplo, dos RTX 5060 Ti de 16 GB), reduciendo la latencia por token gracias a la decodificación especulativa.
- Despliegue de agentes conversacionales con tool calling: el fix de tool-trigger del runtime QVIR-1 R2 habilita flujos agénticos donde el modelo objetivo decide llamar a funciones externas, con el draft model acelerando la generación de respuestas intermedias.
- Inferencia de contexto largo en entornos con restricciones de memoria: al ahorrar ~0,90 GiB de VRAM comparado con el draft Q8_0, se libera espacio para la caché KV del modelo objetivo, permitiendo ventanas de contexto mayores en el mismo hardware.
- Prototipado de sistemas de decodificación especulativa: investigadores pueden usar este artefacto como referencia para estudiar el impacto de la cuantización NVFP4 en la tasa de aceptación de tokens y el throughput.
- Evaluación de perfiles de decodificación especulativa: el repositorio incluye un benchmark detallado (QVIR-1 R2) que documenta el comportamiento del draft en cargas de trabajo con uso intensivo de herramientas, útil para comparar configuraciones.
- Optimización de costes en inferencia self-hosted: al reducir el footprint de memoria del draft model, se pueden desplegar modelos grandes en instancias con menos VRAM, disminuyendo el coste por inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica que, con un modelo objetivo Q4_K_XL a contexto largo, el draft NVFP4 ahorró aproximadamente 0,90 GiB comparado con Q8_0, manteniendo el decode a contexto largo cercano al resultado Q8_0. También se menciona que el dispatcher Blackwell MMQ experimental se activó, pero la muestra disponible no establece una aceleración kernel-only repetible. El benchmark R2 con carga de herramientas mostró una alta varianza en la tasa de aceptación y el throughput, por lo que no se pueden extraer conclusiones cuantitativas fiables.

## Requisitos de hardware

- VRAM estimada para inferencia: el archivo GGUF ocupa ~1,02 GiB, por lo que el draft model cabe en cualquier GPU con al menos 2 GB de VRAM. Sin embargo, el modelo objetivo Qwen3.8-27B requiere mucho más: con cuantización Q4_K_XL y caché KV Q8_0, se necesitan aproximadamente 16 GB de VRAM solo para el target, más el espacio para el draft y la caché.
- GPU recomendadas: el perfil validado usó dos RTX 5060 Ti de 16 GB. En general, se recomienda hardware con soporte para dispatch NVFP4 (Blackwell o posterior) para aprovechar el dispatcher MMQ experimental.
- Compatibilidad con GPUs de consumo: sí, siempre que se disponga de suficiente VRAM para el modelo objetivo. El draft model en sí es muy ligero.
- Opciones de despliegue: llama.cpp con el runtime experimental QVIR-1 R2 (rama `codex/qvir1-release`). No es compatible con builds estándar de llama.cpp, vLLM, Ollama o TGI sin modificaciones.
- Latencia y throughput: no disponibles. La model card advierte que la aceleración no está garantizada y depende fuertemente del contenido del prompt y de la tasa de aceptación especulativa.

## Comparativa con modelos similares

No se dispone de modelos draft comparables de la misma categoría en la información proporcionada. La única comparación posible es con las versiones cuantizadas del mismo draft model:

| Version | Tamano | Diferencia de tamano |
|---|---|---|
| NVFP4 (este modelo) | ~1,02 GiB | Referencia |
| Q8_0 | ~1,92 GiB (estimado) | 46,8% mayor |
| Q4_K_M | ~1,07 GiB (estimado) | 4,3% mayor |

El modelo objetivo Qwen3.8-27B, con 27B parámetros, es el modelo que este draft pretende acelerar. No hay otros draft models públicos para Qwen3.8-27B documentados en la información disponible.

## Limitaciones y advertencias

- Modelo experimental: no es un artefacto de producción. La model card lo califica explícitamente como "experimental" y "no una aceleración garantizada".
- No es un modelo standalone: requiere el modelo objetivo Qwen3.8-27B y el runtime QVIR-1 R2 para funcionar. No puede generar texto por sí mismo.
- Compatibilidad restringida: los builds estándar de llama.cpp no soportan las opciones necesarias (DFlash2, bounded-prefill, `ngram-mod`, tool-trigger, dispatch NVFP4). Solo el runtime experimental del repositorio vinculado puede ejecutarlo.
- Alta varianza de rendimiento: el benchmark R2 con carga de herramientas mostró una varianza muestral alta en la tasa de aceptación y el throughput. El rendimiento depende fuertemente del contenido del prompt.
- Sin datos de sesgos o alucinación: al ser un draft model, no se han evaluado sesgos ni riesgos de alucinación. Estos dependen del modelo objetivo.
- Licencia: Apache-2.0, permite uso comercial, pero el runtime experimental puede tener restricciones adicionales no documentadas.
- Fecha de creación futura: el modelo fue creado el 2026-08-26, lo que sugiere que es un artefacto muy reciente y posiblemente inestable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/costanzopadovano/Qwen3.8-27B-DFlash2-NVFP4-GGUF
- Modelo base (draft original): https://huggingface.co/z-lab/Qwen3.8-27B-DFlash2
- Modelo objetivo: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del runtime QVIR-1 R2: https://github.com/CostanzoPadovano/qwen38-nvfp4-analytical-lab
- Rama de release: https://github.com/CostanzoPadovano/qwen38-nvfp4-analytical-lab/tree/codex/qvir1-release
- Commit inmutable R2: https://github.com/CostanzoPadovano/qwen38-nvfp4-analytical-lab/commit/07ccb1f3c80d7ab9875a5f0c402526d4644bd3b6
- Documento de validación y benchmark R2: https://github.com/CostanzoPadovano/qwen38-nvfp4-analytical-lab/blob/codex/qvir1-release/docs/qvir1_r2_qwen38_tool_trigger_fix_20260826.md
- Modelo objetivo híbrido analítico (pareja recomendada): https://huggingface.co/costanzopadovano/Qwen3.8-27B-NVFP4-Q8-Hybrid-Analytical-GGUF
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página de vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
