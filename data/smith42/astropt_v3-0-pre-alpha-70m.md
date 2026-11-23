# Smith42/astroPT_v3.0-pre-alpha-70m

## Resumen

AstroPTv3 70M es un modelo de investigación de tipo "large observation model" para astronomía, desarrollado por Smith42 en el marco del proyecto abierto UniverseTBD. Se trata de un transformer decoder-only entrenado de forma autorregresiva sobre secuencias intercaladas de imágenes, espectros y valores escalares de catálogo correspondientes a un mismo objeto astronómico. El checkpoint publicado es un snapshot pre-alpha (paso 80.000) y no un modelo terminado: el propio autor advierte que los pesos, el formato de configuración y el código de carga pueden cambiar sin aviso.

El modelo combina un backbone de 69,4 millones de parámetros (23 capas, dimensión oculta 512, 8 cabezas de query y 2 de KV) con flujos normalizadores y cabezas de mezcla gaussiana por modalidad, hasta alcanzar 192,4 millones de parámetros totales. Cubre 59 modalidades, entre ellas imágenes de Legacy Survey North/South, HSC, espectros DESI y SDSS, RGB de galaxies-with-hats, GZ10 y escalares de catálogo. Está pensado como base para explorar el modelado generativo multimodal en astronomía, no para uso en producción.

Su relevancia actual es la de un artefacto de investigación reproducible: libera pesos en safetensors bfloat16, fija la semilla (42) y el commit de código exacto (`b627214`), y documenta con honestidad sus fallos conocidos. No obstante, no se ha validado en ninguna tarea downstream ni se han publicado benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only autorregresivo con flujos normalizadores por modalidad y cabezas de mezcla gaussiana |
| Parámetros totales | 192.403.456 (backbone: 69,4 M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en bfloat16) |
| Idiomas soportados | No disponible (modelo multimodal astronómico, no lingüístico) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El backbone es un transformer decoder-only de 23 capas con hidden size 512 y atención con 8 cabezas de query y 2 de KV (GQA). Sobre él se añaden flujos normalizadores específicos por modalidad y cabezas de mezcla gaussiana que permiten modelar tokens continuos (píxeles, flujos espectrales, escalares) en lugar de tokens discretos. El entrenamiento es autorregresivo sobre secuencias intercaladas de las 59 modalidades del mismo objeto astronómico.

El checkpoint corresponde al paso 80.000, con batch global de 32 × 4096 tokens, lo que supone aproximadamente 2.100 millones de tokens frescos sin padding (10.500 millones contando padding y el eco ×4). Se usó LR 1e-3 con warmup de 2.000 pasos y decaimiento coseno hasta 1e-4, semilla 42 y precisión bfloat16. Los datasets de entrenamiento son `UniverseTBD/mmu_ssl_legacysurvey_north`, `hugging-science/mmu_legacysurvey_dr10_south_21`, `UniverseTBD/mmu_sdss_sdss`, `UniverseTBD/mmu_desi_edr_sv3`, `hugging-science/mmu_hsc_pdr3_wide_21`, `Smith42/galaxies-with-hats`, `UniverseTBD/mmu_desi_provabgs` y `UniverseTBD/mmu_gz10`. No se documenta RLHF, DPO ni ninguna fase de alineamiento.

## Capacidades

- Generación autorregresiva de secuencias multimodales intercaladas de objetos astronómicos.
- Modelado generativo de imágenes de Legacy Survey North/South y HSC.
- Modelado generativo de espectros DESI y SDSS (nivel de continuo aproximadamente correcto).
- Modelado de escalares de catálogo y etiquetas Galaxy Zoo (GZ10).
- Modelado de imágenes RGB de galaxias (galaxies-with-hats), aunque con calidad muy limitada en este checkpoint.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe ni de texto natural: no es un modelo de lenguaje.

## Casos de uso

- Investigación sobre modelado generativo multimodal en astronomía: el modelo sirve como banco de pruebas para estudiar cómo se comportan flujos normalizadores y cabezas gaussianas sobre datos heterogéneos (imágenes, espectros, escalares) de un mismo objeto.
- Estudio de representaciones internas de observaciones astronómicas: al ser un backbone pequeño (69,4 M) y con licencia abierta, es viable extraer activaciones y analizarlas en un entorno académico.
- Reproducción de experimentos: el checkpoint fija semilla, commit y receta de entrenamiento, lo que permite reproducir el paso 80.000 y comparar variantes.
- Desarrollo de pipelines de datos multimodales: los datasets de entrenamiento y el código de carga (`astropt3`) pueden reutilizarse para construir flujos de preprocesado de Legacy Survey, DESI, SDSS y HSC.
- Docencia y divulgación: por su tamaño reducido (0,4 GB de repo) y su naturaleza abierta, es adecuado para demonstrar conceptos de modelado autorregresivo multimodal en astronomía.
- Base para fine-tuning exploratorio: aunque no validado, el checkpoint puede servir como inicialización para experimentos supervisados en tareas astronómicas concretas, siempre con evaluación propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se ha ejecutado ninguna evaluación sobre datos reservados (held-out) para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en bfloat16 ocupa aproximadamente 0,4 GB (192 M de parámetros), por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna (RTX 3060 en adelante, A100, H100) es suficiente; no se requiere hardware de datacenter.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 4 GB de VRAM.
- Opciones de despliegue: la carga se realiza vía `transformers` con `AutoModel.from_pretrained` tras instalar el paquete `astropt3` desde el repositorio de código; la generación se hace con `astro/scripts/generate.py`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (large observation models multimodales para astronomía) con los que establecer una comparación de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Versión pre-alpha: los pesos, el formato de configuración y el código de carga pueden cambiar sin aviso.
- Las modalidades RGB (`galaxies`, galaxies-with-hats) producen ruido coloreado por parches a las 74k pasos; no son utilizables.
- Las imágenes de Legacy South solo empezaron a parecerse a galaxias al final del entrenamiento (≈74k pasos); son compactas y centradas pero demasiado pequeñas y con bordes de parche visibles.
- Los espectros generados tienen un nivel de continuo aproximadamente correcto, pero presentan picos espurios y carecen de líneas en el redshift correcto.
- La generación condicional no está validada: no se ha ejecutado ninguna evaluación sobre datos reservados.
- La pérdida de la modalidad `galaxies` fue inestable durante el entrenamiento, con saltos entre aproximadamente −1 y −950 nats por parche; se sospecha de un learning rate demasiado alto para este tamaño.
- No es un modelo de lenguaje: no soporta texto natural, tool calling ni agentes.
- Licencia CC-BY-SA-4.0: obliga a atribución y a compartir las obras derivadas bajo la misma licencia; conviene revisar compatibilidad antes de uso comercial.
- No apto para producción: es un snapshot de investigación sin garantías de calidad ni de estabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Smith42/astroPT_v3.0-pre-alpha-70m
- Código (commit fijado): https://github.com/Smith42/AstroPTv3/tree/b627214fb1ed069be8f72b6d46c1d665be531e58
- Proyecto UniverseTBD: https://universetbd.org
- Discord de UniverseTBD: https://discord.gg/MNEVegvfJq
