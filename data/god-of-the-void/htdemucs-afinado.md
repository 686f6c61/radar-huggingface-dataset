# god-of-the-void/HTDemucs-afinado

## Resumen

HTDemucs-afinado es un ajuste fino (fine-tune) del modelo HTDemucs de separación de fuentes musicales desarrollado originalmente por Alexandre Défossez en Meta AI. Lo publica el colectivo GOD OF THE VOID (CHAOS-X) bajo el identificador `god-of-the-void/HTDemucs-afinado`. No es una arquitectura nueva: es el mismo separador de cuatro pistas (voces, batería, bajo y "otros") reentrenado durante 2000 pasos con música de licencia abierta para mejorar la nitidez de instrumentos y voces. El resultado reportado es una mejora de SDR de entre 0,07 y 3,21 dB según el conjunto de evaluación.

El interés técnico del proyecto reside tanto en el modelo como en su proceso: el ajuste fino se ejecutó con un entrenador propio escrito en Rust sobre MLX (sin Python) en un Apple M1 Max, tras verificar que los gradientes coincidían con los de PyTorch en los 533 parámetros del modelo con un error relativo de 2,2e-5. El checkpoint publicado ocupa 84 MB en formato safetensors y se distribuye junto a un YAML de "bag" de Demucs que apunta a los pesos.

La relevancia es doble: por un lado, ofrece una mejora medible sobre HTDemucs en separación de voces e instrumentos con datos exclusivamente Creative Commons; por otro, demuestra la viabilidad de entrenar modelos de audio en hardware Apple Silicon con un stack nativo en Rust y MLX. La licencia es la principal advertencia: los pesos heredan el estatus jurídico incierto de HTDemucs (entrenado con MUSDB, de uso solo para investigación) y se publican exclusivamente para investigación y evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | HTDemucs (Hybrid Transformer Demucs, Rouard, Massa y Défossez, ICASSP 2023) |
| Parametros totales | 533 parametros (segun la verificacion de gradientes del autor); pesos de 84 MB en safetensors |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; procesa segmentos de audio, no tokens de texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje; es independiente del idioma) |
| Licencia | unknown / sin licencia otorgada; uso solo para investigacion, sin uso comercial, sin garantia |
| Formato de pesos | safetensors (`afinado.safetensors`) + YAML de bag de Demucs (`afinado.yaml`) |

## Arquitectura y entrenamiento

La arquitectura es HTDemucs (Hybrid Transformer Demucs), un modelo híbrido que combina un codificador/decodificador convolucional con atención transformer sobre el espectrograma para separar una mezcla musical en cuatro pistas: voces, batería, bajo y otros. El ajuste fino no modifica la arquitectura; parte de los pesos de `adefossez/HTDemucs` y los especializa con datos adicionales.

El entrenamiento se realizó con el entrenador propio de GOTV, escrito en Rust y ejecutado sobre MLX en un Apple M1 Max, sin Python. Antes de entrenar se validó la corrección de los gradientes frente a PyTorch en los 533 parámetros del modelo, con un error relativo de 2,2e-5. Se entrenaron 2000 pasos y se seleccionó como mejor checkpoint el paso 1750. Los datos de entrenamiento son todos de licencia Creative Commons Attribution y no se distribuyen con el modelo: Slakh2100 (CC BY 4.0), VocalSet (CC BY 4.0) y 447 a cappellas de ccMixter (CC BY 2.5 y 3.0), con cada pista acreditada en `CREDITOS-ccmixter.tsv` y verificación de que ninguna tuviera cláusulas NC o SA. No se menciona uso de RLHF ni DPO (no aplica a un modelo de separación de fuentes).

## Capacidades

- Separación de fuentes musicales en cuatro pistas: voces, batería, bajo y otros.
- Procesamiento audio-a-audio (pipeline `audio-to-audio`).
- Mejora reportada sobre HTDemucs en instrumentos y voces, con incrementos de SDR medidos en varios conjuntos de evaluación.
- Integración en la aplicación de GOD OF THE VOID mediante el menú Settings → Generators → HTDemucs-afinado.
- Uso desde terminal mediante la CLI `gotv` (comandos `generadores aceptar`, `generadores bajar` y `split`).
- Compatibilidad con el ecosistema Demucs a través del archivo de bag `afinado.yaml`, que apunta a los pesos.
- Metadatos originales `klass`/`kwargs` conservados en el safetensors.
- Capacidades multilingües: no aplica (modelo de audio).
- Tool calling, agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).

## Casos de uso

- Separación de pistas para producción musical: extraer voces, batería, bajo y "otros" de una mezcla para remezclar, samplear o crear versiones instrumentales y a cappella; el modelo está afinado específicamente para mejorar la nitidez de voces e instrumentos.
- Creación de karaokes y versiones a cappella: la mejora en la pista de voces (SDR 19,94 dB frente a 19,14 dB del base en voces reales retenidas) lo hace adecuado para aislar la voz cantada con menos artefactos.
- Investigación en separación de fuentes: sirve como punto de comparación reproducible frente a HTDemucs, con evaluación publicada en `juicio.json` y números por pista en Slakh2100.
- Experimentación con entrenamiento en Apple Silicon: el proyecto documenta un flujo completo de fine-tuning en Rust + MLX sobre M1 Max con verificación de gradientes, útil como referencia para reproducir o extender el método.
- Evaluación de modelos de audio en pipelines de investigación: al estar limitado a uso de investigación, encaja en entornos académicos y de benchmarking, no en productos comerciales.
- Procesamiento por lotes desde terminal: la CLI `gotv split` permite integrar la separación en scripts de procesamiento de bibliotecas musicales, siempre dentro del ámbito de investigación permitido.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card (SDR en dB, mayor es mejor):

| Conjunto de prueba | HTDemucs | HTDemucs-afinado |
|---|---:|---:|
| Slakh2100 test (media de drums, bass, other) | 12,44 | 15,65 |
| Voces reales retenidas (media de 4 pistas) | 13,46 | 15,58 |
| Voces reales retenidas (pista de voces) | 19,14 | 19,94 |
| 8 voces de referencia aisladas (voces) | 15,35 | 15,42 |

Por pista en Slakh2100 test: drums 15,06 · bass 14,09 · other 17,80. Los números brutos y el recuento de pistas están en `juicio.json`. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un modelo de separación de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; los pesos ocupan 84 MB, por lo que el modelo es muy ligero en memoria.
- GPU recomendadas: no disponible; el autor documenta el entrenamiento en Apple M1 Max con MLX, y el despliegue se realiza mediante la app de GOD OF THE VOID o la CLI `gotv`.
- ¿Cabe en GPU de consumo? Por el tamaño de los pesos (84 MB) es previsible que sí, pero no se especifican requisitos oficiales ni GPUs concretas compatibles.
- Opciones de despliegue: aplicación de GOD OF THE VOID (Settings → Generators → HTDemucs-afinado) y CLI `gotv` (`gotv split song.mp3`); integración con Demucs mediante `afinado.yaml`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Rendimiento (SDR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HTDemucs-afinado (este) | 533 parametros; 84 MB safetensors | no aplica | Slakh2100 15,65; voces 19,94 | unknown, solo investigacion | Hugging Face, app GOTV, CLI |
| HTDemucs (adefossez) | no disponible; modelo base | no aplica | Slakh2100 12,44; voces 19,14 | pesos con licencia incierta (MUSDB solo investigacion) | Hugging Face / Demucs |
| Otros separadores de 4 pistas (p. ej. variantes de Demucs) | no disponible | no aplica | no disponible | no disponible | no disponible |

La comparativa directa disponible se limita al modelo base HTDemucs, del que este es un fine-tune. No se han proporcionado datos de otros separadores comparables en la información disponible.

## Limitaciones y advertencias

- Licencia: no se otorga ninguna licencia. Los pesos derivan de HTDemucs, cuyo autor declara que "la licencia de los pesos no está clara" porque MUSDB, dataset de entrenamiento del base, contiene datos solo para investigación. Uso exclusivamente para investigación y evaluación; prohibido el uso comercial y sin garantía.
- Entrenamiento corto: solo 2000 pasos, muy por debajo de los fine-tunes oficiales; mejora el base pero no sustituye un entrenamiento completo.
- Datos sintéticos: Slakh2100 se renderiza desde MIDI, por lo que mezclas reales con efectos intensos pueden obtener mejoras menores que las reportadas.
- Riesgo de alucinación: no aplica en el sentido de texto, pero la separación puede introducir artefactos o sangrado entre pistas en mezclas complejas.
- Sesgos: no documentados; los datos de entrenamiento son de licencia abierta (Slakh2100, VocalSet, ccMixter) y podrían no representar todos los géneros o estilos musicales.
- Limitaciones de idioma: no aplica (modelo de audio independiente del idioma).
- Advertencia para producción: al no haber licencia clara, no debe desplegarse en productos comerciales hasta que se aclare el estatus del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; proyecto de investigación reciente sin validación externa independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/god-of-the-void/HTDemucs-afinado
- Repositorio del proyecto: https://github.com/CHAOSX-SPACE/god-of-the-void
- Sitio de CHAOS-X: https://chaosx.space
- Modelo base: https://huggingface.co/adefossez/HTDemucs
- Repositorio Demucs y licencia: https://github.com/adefossez/demucs/blob/main/README.md#license
- Paper HTDemucs (Rouard, Massa, Défossez, ICASSP 2023): no disponible como enlace directo en la información proporcionada
- Slakh2100: https://zenodo.org/records/4599666
- VocalSet: https://zenodo.org/records/1193957
