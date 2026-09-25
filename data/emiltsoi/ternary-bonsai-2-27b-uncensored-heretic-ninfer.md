# emiltsoi/Ternary-Bonsai-2-27B-Uncensored-Heretic-NInfer

## Resumen

Ternary-Bonsai-2-27B-Uncensored-Heretic-NInfer es un artefacto nativo del motor NInfer (formato `.ninfer`) publicado por el usuario emiltsoi. Empaqueta en un único fichero de 9.520.051.456 bytes la variante decensurada del modelo ternario Ternary Bonsai 2 27B, junto con la torre de visión de Qwen3.8-27B, una cabeza MTP y el adaptador completo de decodificación especulativa DFlash2. El modelo base procede de PrismML (Ternary Bonsai 2, derivado a su vez de Qwen3.8-27B) y el decensurado lo aporta OS-Software mediante una LoRA Heretic integrada en los códigos ternarios (34 de 851 matrices modificadas), con licencia Apache-2.0 en toda la cadena.

El problema que resuelve es de disponibilidad de formato: hasta ahora la versión decensurada de Bonsai 2 solo existía en GGUF y MLX, formatos que ningún build de NInfer puede cargar y que no ofrecen DFlash2 en absoluto. Este artefacto lleva ese modelo al motor NInfer conservando la decodificación especulativa, el heads MTP y la visión en un solo fichero.

Es relevante para quienes necesitan un modelo de 27B sin capa de rechazo ejecutándose con decodificación especulativa sobre GPU de consumo. El autor advierte que se trata de un artefacto probado con smoke tests y no con una suite de benchmarks, y que la aceptación del borrador DFlash2 cae a ~20 % frente al 57-63 % del artefacto oficial alineado, porque el adaptador se entrenó sobre las características del modelo sin ablacionar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-27B, con proyecciones de lenguaje ternarias, torre de visión y cabeza MTP; decodificación especulativa DFlash2 |
| Parametros totales | 27B (denominación del modelo; no se publica desglose por componente) |
| Parametros activos | no aplica (no se describe una arquitectura MoE en la información disponible) |
| Longitud de contexto | hasta 1.048.576 tokens (`--max-context 1048576` en el ejemplo de lanzamiento); el autor considera fiable la ventana de ~500.000-700.000 tokens |
| Tipos de cuantizacion | proyecciones de lenguaje ternarias `t2_g128_fp16`; torre de visión en Q4/Q5; controles GDN en BF16/FP32; base upstream en PQ2_0 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.ninfer` (1.193 objetos, 9.520.051.456 bytes, checksum en `SHA256SUMS`) |

## Arquitectura y entrenamiento

No se trata de un entrenamiento nuevo, sino de una conversión y empaquetado. Los pesos de lenguaje proceden de `OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF`, en cuantización PQ2_0, con la LoRA Heretic ya integrada en los códigos ternarios (34 de 851 matrices afectadas). La torre de visión, el tokenizer, la plantilla de chat y los preprocesadores multimedia provienen del checkpoint oficial `Qwen/Qwen3.8-27B`, con la torre sin cuantizar en origen y almacenada en Q4/Q5 (27 bloques más el merger). La cabeza MTP viene de `ProCreations/Ternary-Bonsai-2-27B-MTP` y el adaptador DFlash2 de `ProCreations/Ternary-Bonsai-2-27B-DFlash2`.

La conversión se realizó con la receta `bonsai2_27b_ternary` de `tools/convert` del repositorio `iamwavecut/ninfer-3090`, la misma que se usó para el artefacto oficial `WaveCut/Ternary-Bonsai-2-27B-NInfer-v3`; el tamaño en bytes resultante es idéntico al de ese artefacto. El paquete incluye la pila completa de DFlash2 (proyección de características, 5 capas de borrador, kernels de convolución, codebooks del selector de candidatos) y la cabeza de propuesta ternaria. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF o DPO.

## Capacidades

- Generación de texto en formato `.ninfer` con pipeline `text-generation`, decodificada por el motor NInfer consolidado.
- Visión: la torre de Qwen3.8-27B está incluida y el autor indica que fue verificada sobre una imagen de prueba; se activa con `--vision --vision-residency overlay --vision-max-merged 12288`.
- Decodificación especulativa DFlash2 con 7 tokens de borrador (`--spec dflash2 --draft-tokens 7`), que según el autor multiplica aproximadamente por tres el throughput de decodificación en bruto pese a la baja aceptación.
- Predicción multi-token (MTP) mediante cabeza dedicada.
- Contexto largo: gestión de KV configurable hasta 1.048.576 tokens con cuantización `rk4v4-e8`.
- Comportamiento decensurado verificado: responde a peticiones que el artefacto oficial rechaza.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado en la información proporcionada.
- Capacidades multilingües: no disponible.

## Casos de uso

- Red teaming y evaluación de seguridad: el modelo sirve como sujeto de prueba para medir qué tipos de peticiones atraviesan un modelo sin capa de rechazo, en un entorno con controles de acceso propios, dado que los pesos no aplican ninguna política.
- Investigación sobre comportamiento de rechazo: comparar las respuestas de esta variante con las del artefacto oficial alineado permite aislar el efecto del decensurado sobre prompts idénticos.
- Generación de texto creativo sin filtros editoriales: ficción, guiones y materiales de escritura donde el autor del despliegue asume la responsabilidad del contenido, aprovechando la ventana de contexto larga para mantener coherencia en obras extensas.
- Procesamiento de documentos largos con componente visual: la combinación de torre de visión y contexto de hasta 1M tokens permite analizar informes escaneados o presentaciones extensas, aunque conviene limitar la ventana a 500.000-700.000 tokens por la degradación de recuperación documentada.
- Generación por lotes de alto rendimiento: con prefill de 880-1.150 tok/s y decodificación de 280-580 tok/s en RTX 5090, el modelo es adecuado para tareas de reescritura, resumen o transformación masiva de texto donde el coste por token importa.
- Despliegue en GPU de consumo con múltiples usuarios moderados: el ejemplo de lanzamiento usa `--max-concurrency 2` con un footprint de ~19,1 GiB, lo que permite servir dos flujos concurrentes en una única RTX 4090 o 5090 sin clúster.
- Sustitución de la cadena GGUF en instalaciones NInfer existentes: equipos que ya operan la línea NInfer pueden incorporar la variante decensurada sin cambiar de motor ni renunciar a DFlash2.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no reclama cifras de perplejidad ni de suites de evaluación. Las únicas mediciones aportadas son smoke tests ejecutados sobre una RTX 5090 con build sm_120a:

| Metrica | Valor |
|---|---|
| Arranque | ~3,3 s (pesos de 7,99 GiB) |
| Huella en ejecución | ~19,1 GiB con KV `rk4v4-e8` de 1.048.576 tokens |
| Prefill | ~880-1.150 tok/s |
| Decodificación (DFlash2) | ~280-580 tok/s según el prompt |
| Aceptación del borrador DFlash2 | ~20 % (frente a ~57-63 % del artefacto oficial alineado) |
| Vision | verificada sobre imagen de prueba |
| Comportamiento decensurado | verificado |

## Requisitos de hardware

- VRAM: los pesos ocupan 7,99 GiB, pero la huella en ejecución medida es de ~19,1 GiB con KV `rk4v4-e8` a 1.048.576 tokens. El autor indica que se necesitan aproximadamente 20 GiB libres para esa configuración.
- GPU recomendadas: clase RTX 3090, RTX 4090 y RTX 5090. El build medido corresponde a sm_120a (RTX 5090).
- GPU de consumo: sí, cabe en tarjetas de 24 GiB. En tarjetas menores el autor señala que pueden reducirse `--kv-capacity` y el contexto en consecuencia.
- Motor de despliegue: exclusivamente la línea NInfer consolidada (`iamwavecut/ninfer-3090` o un build descendiente). Los releases upstream de `ninfer` no decodifican pesos `t2_g128_fp16`. No hay soporte documentado para llama.cpp, Ollama, vLLM o TGI con este artefacto.
- Flags relevantes del ejemplo: `--spec dflash2 --draft-tokens 7`, `--kv-dtype rk4v4-e8`, `--kv-capacity 1048576`, `--max-context 1048576`, `--gdn-state-fp16`, `--max-concurrency 2`, `--cors`, `--port 11435`.
- Latencia y throughput: prefill ~880-1.150 tok/s y decodificación ~280-580 tok/s en RTX 5090 según los smoke tests del autor.
- Verificación de integridad: `SHA256SUMS` incluye el checksum del artefacto; se recomienda validarlo con `certutil -hashfile` en Windows o `sha256sum` en Linux antes de servirlo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | DFlash2 | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| emiltsoi/Ternary-Bonsai-2-27B-Uncensored-Heretic-NInfer | 27B | hasta 1.048.576 tokens | Aceptación ~20 % | Apache-2.0 | `.ninfer` | Variante decensurada; artefacto de terceros; mismo tamaño en bytes que el v3 oficial |
| WaveCut/Ternary-Bonsai-2-27B-NInfer-v3 | 27B | no disponible (misma receta de conversión) | Aceptación ~57-63 % | no disponible | `.ninfer` | Artefacto oficial alineado; es la referencia de rendimiento DFlash2 que cita el autor |
| OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF | 27B | no disponible | No soportado | Apache-2.0 (según la cadena declarada) | GGUF | Base decensurada en PQ2_0; cargable por motores GGUF, sin DFlash2 |
| prism-ml/Ternary-Bonsai-2-27B-gguf | 27B | no disponible | No soportado | no disponible | GGUF | Base ternaria original de PrismML, sin decensurar |

## Limitaciones y advertencias

- Sin capa de seguridad: el modelo está deliberadamente decensurado y responderá a peticiones que el modelo oficial rechaza. El despliegue debe aportar sus propios controles de acceso y políticas; nada en los pesos las aplica.
- Aceptación baja del borrador especulativo: ~20 % frente al 57-63 % del artefacto alineado, porque el adaptador DFlash2 y la tabla de propuesta se entrenaron sobre las características del modelo sin ablacionar. No es un artefacto corrupto, pero invalida cualquier comparación directa de velocidad con el v3.
- Sin cifras de calidad: no hay resultados de perplejidad ni de suites de evaluación; solo smoke tests.
- Degradación de recuperación en contexto largo: heredada del modelo base, la recuperación empeora en el extremo lejano de la ventana de 1M tokens; el autor recomienda tratar 500.000-700.000 tokens como la ventana fiable.
- Dependencia estricta del motor: requiere la línea NInfer consolidada. Los releases upstream de `ninfer` no decodifican los pesos `t2_g128_fp16`, por lo que el artefacto no es portable a otras herramientas de inferencia.
- Riesgo de alucinación: no cuantificado en la información disponible; al ser un modelo decensurado, la ausencia de capas de rechazo también elimina las señales de incertidumbre que a veces acompañan a esas capas.
- Sesgos conocidos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe más allá de lo que herede de la base Qwen.
- Adopción muy baja: 0 descargas y 0 likes en el momento de la consulta, lo que implica poca validación externa del artefacto.
- Licencia: Apache-2.0 declarada en la ficha, aunque conviene verificar la cadena completa (PrismML, OS-Software, ProCreations) antes de un uso comercial.

## Enlaces

- HuggingFace: https://huggingface.co/emiltsoi/Ternary-Bonsai-2-27B-Uncensored-Heretic-NInfer
- Modelo base (decensurado, GGUF): https://huggingface.co/OS-Software/Ternary-Bonsai-2-27B-Uncensored-Heretic-GGUF
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf
- Motor NInfer y receta de conversión: https://github.com/iamwavecut/ninfer-3090
- Checkpoint de referencia para torre de visión, tokenizer y plantilla de chat: `Qwen/Qwen3.8-27B` (referenciado en la model card; no se proporciona URL directa)
- Cabeza MTP: `ProCreations/Ternary-Bonsai-2-27B-MTP` (referenciado en la model card; no se proporciona URL directa)
- Adaptador DFlash2: `ProCreations/Ternary-Bonsai-2-27B-DFlash2` (referenciado en la model card; no se proporciona URL directa)
- Artefacto oficial de referencia: `WaveCut/Ternary-Bonsai-2-27B-NInfer-v3` (referenciado en la model card; no se proporciona URL directa)
- Resultados de búsqueda web: no se han encontrado enlaces técnicos relevantes sobre este modelo; los resultados devueltos no guardan relación con el artefacto.
