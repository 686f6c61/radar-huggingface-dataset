# Caistro-Labs/qwen2.5-72b-akkadian-en-lora

## Resumen

El modelo `Caistro-Labs/qwen2.5-72b-akkadian-en-lora` es un adaptador LoRA sobre el modelo base Qwen2.5-72B, desarrollado por Caistro-Labs, especializado en la traducción de acadio transliterado a inglés. El acadio es la lengua de las tablillas cuneiformes de la antigua Mesopotamia, y este adaptador convierte una línea de acadio transliterado en un borrador de traducción al inglés. Resuelve un problema de nicho pero relevante para la investigación asiriológica: la traducción automática de textos cuneiformes, una tarea en la que los modelos generalistas rinden muy por debajo de lo aceptable (el modelo base obtiene 1,64 BLEU).

La relevancia del proyecto radica en dos factores. Primero, el salto de rendimiento: el adaptador alcanza 50,08 BLEU en decodificación greedy sobre el split de test de Akkademia (2.870 líneas), frente al 1,64 del modelo base. Segundo, el método de entrenamiento: los autores afirman haber entrenado el adaptador con su herramienta Poros en tarjetas de 24 GB (RTX 3090 y RTX 4090), lo que demuestra que es viable ajustar un modelo de 72B mediante LoRA en hardware de consumo.

El adaptador tiene 421 millones de parámetros entrenables (frente a los 72B del modelo base) y un tamaño de repositorio de 2,5 GB. Se distribuye en formato safetensors y GGUF, con licencia CC-BY-SA-4.0. Se debe cargar sobre la versión base de Qwen2.5-72B, no sobre la versión Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer decoder-only Qwen2.5-72B |
| Parametros totales | 421.068.800 (adaptador); modelo base Qwen2.5-72B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-72B) |
| Tipos de cuantizacion | safetensors (adaptador), GGUF |
| Idiomas soportados | acadio (akk), inglés (en) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) aplicado sobre el modelo base Qwen2.5-72B, un transformer decoder-only de 72.000 millones de parámetros. El adaptador añade 421 millones de parámetros entrenables, lo que permite ajustar la tarea de traducción sin modificar los pesos del modelo base. La librería declarada es PEFT.

El entrenamiento se realizó con la herramienta Poros, desarrollada por los propios autores, en tarjetas de 24 GB: las primeras 537 de 3.156 actualizaciones en una RTX 3090 y el resto en una RTX 4090. El conjunto de datos de entrenamiento es el corpus Akkademia, con un split de test de 2.870 líneas y un split de validación de 2.812 líneas. Los autores señalan que 463 de las 2.870 líneas de test aparecen literalmente en el split de entrenamiento, por lo que reportan también métricas sobre las 2.407 líneas que no aparecen en entrenamiento. No se especifica en la información disponible el número total de tokens de entrenamiento ni la composición detallada del dataset más allá de la referencia a Akkademia.

Una innovación metodológica destacable es la transparencia en la evaluación: los autores declaran que la decodificación greedy se ejecutó bajo un plan escrito antes del run y que su resultado es el registrado, mientras que la búsqueda por haz (beam 4) se planificó después de conocer el resultado greedy, por lo que se reporta al lado y no en su lugar. También reportan intervalos de confianza mediante bootstrap emparejado de 1.000 remuestreos.

## Capacidades

- Traducción de acadio transliterado a inglés: convierte una línea de transliteración cuneiforme en un borrador de traducción al inglés.
- Traducción de textos de la tradición mesopotámica recogidos en el corpus Akkademia (presagios, textos astronómicos, entre otros).
- Manejo de transliteraciones con signos determinativos y notación especializada (por ejemplo, `{d}` para determinativo divino).
- Generación de borradores de traducción con calidad medida mediante BLEU y chrF++.
- No dispone de tool calling, function calling ni capacidades de agente declaradas.
- No dispone de modo thinking, visión ni audio declarados.
- Capacidades multilingües limitadas a acadio e inglés.

## Casos de uso

- Asistencia a la traducción de tablillas cuneiformes: el adaptador genera un borrador de traducción al inglés de una línea de acadio transliterado, que el asiriólogo revisa y corrige, reduciendo el tiempo de traducción inicial en corpus de gran volumen.
- Procesamiento por lotes de corpus transliterados: al poder ejecutarse sobre el modelo base con adaptadores PEFT, permite traducir automáticamente miles de líneas de un corpus digitalizado y priorizar la revisión humana sobre los pasajes más relevantes.
- Investigación en humanidades digitales: sirve como línea base reproducible para experimentos de traducción automática de lenguas antiguas, con métricas y firmas de sacreBLEU documentadas para replicación.
- Preservación y difusión de patrimonio: permite generar traducciones de borrador de textos mesopotámicos para catálogos, exposiciones o divulgación, con revisión experta posterior.
- Docencia de asiriología: proporciona a estudiantes un borrador de traducción sobre el que trabajar y comparar con traducciones académicas, gracias a su rendimiento medido sobre líneas no vistas en entrenamiento.
- Evaluación comparativa de sistemas de traducción de lenguas antiguas: sus resultados publicados (BLEU 50,08 greedy, 51,41 beam 4) y la comparación con Akkademia (2023) y TabletCraft (2026) permiten usarlo como referencia en estudios comparativos.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo (no verificados):

| Sistema | Líneas | BLEU | chrF++ |
|---|---:|---:|---:|
| Este adaptador, test, greedy (resultado registrado) | 2.870 | 50,08 | 63,55 |
| Este adaptador, test, beam 4 | 2.870 | 51,41 | 64,60 |
| Este adaptador, líneas de test ausentes en entrenamiento, greedy | 2.407 | 48,05 | 62,01 |
| Este adaptador, líneas de test ausentes en entrenamiento, beam 4 | 2.407 | 49,29 | 63,10 |
| Qwen2.5-72B base, test, greedy | 2.870 | 1,64 | 14,68 |
| Akkademia (2023), test, re-puntuado por los autores | 2.870 | 38,47 | 49,73 |
| Este adaptador, validación sin ajuste, greedy | 2.312 | 47,00 | 63,33 |
| Este adaptador, validación sin ajuste, beam 4 | 2.312 | 48,58 | 64,15 |
| Este adaptador, validación completa, beam 4 | 2.812 | 49,45 | 64,29 |
| TabletCraft (2026), validación, según lo reportado | 2.812 | 49,1 | 63,1 |

Firmas de reproducción: BLEU `nrefs:1|case:mixed|eff:no|tok:13a|smooth:exp|version:2.6.0`; chrF++ `nrefs:1|case:mixed|eff:yes|nc:6|nw:2|space:no|version:2.6.0`.

Los autores reportan que, frente a Akkademia con decodificación greedy, el adaptador supera en 11,61 BLEU (rango del 95%: 10,27 a 12,64 sobre 1.000 remuestreos bootstrap emparejados); con beam 4, la ventaja es de 12,94 (rango 11,44 a 13,81). Frente a TabletCraft, la comparación justa sobre 2.312 líneas de validación sin ajuste da 47,00 BLEU y 63,33 chrF++ en greedy, y 48,58 y 64,15 en beam 4: por detrás en BLEU y por delante en chrF++. En el split completo con beam 4 obtiene 49,45 y 64,29. TabletCraft no publicó resultados de test ni sus salidas, por lo que no hay comparación en test.

## Requisitos de hardware

- El adaptador en sí ocupa 2,5 GB, pero requiere cargar el modelo base Qwen2.5-72B para la inferencia.
- VRAM estimada para el modelo base en precisión completa (FP16/BF16): aproximadamente 144 GB, distribuible en múltiples GPU.
- VRAM estimada con cuantización de 4 bits del modelo base: del orden de 40-45 GB, viable en una A100 de 80 GB o en configuraciones multi-GPU.
- GPU recomendadas: A100 80 GB, H100 80 GB, o múltiples RTX 4090/A6000 para el modelo base cuantizado.
- El adaptador no cabe en una única GPU de consumo junto con el modelo base de 72B en precisión completa; sí es posible con el base cuantizado y reparto entre varias GPU.
- El entrenamiento del adaptador se realizó en tarjetas de 24 GB (RTX 3090 y RTX 4090) con la herramienta Poros, según los autores.
- Opciones de despliegue: PEFT, vLLM, llama.cpp, Ollama y TGI (siempre que soporten la carga del adaptador sobre el modelo base).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | BLEU (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-72B LoRA) | 421 M (adaptador) + 72B base | no disponible | 50,08 greedy / 51,41 beam 4 | CC-BY-SA-4.0 | Hugging Face |
| Akkademia (2023) | no disponible | no disponible | 38,47 (re-puntuado) | no disponible | Salidas públicas |
| TabletCraft (2026) | no disponible | no disponible | 49,1 (validación) | no disponible | Salidas no públicas |
| Qwen2.5-72B base (sin adaptador) | 72B | no disponible | 1,64 | no disponible | Hugging Face |

## Limitaciones y advertencias

- El adaptador solo ha visto los tipos de texto del corpus Akkademia; su rendimiento fuera de esa distribución es incierto.
- El inglés fluido puede ocultar errores de significado: los autores documentan un caso en el que el adaptador traduce un presagio con un sentido distinto al de la traducción académica.
- Riesgo de alucinación en pasajes oscuros o fragmentarios, dado que el modelo genera texto plausible aunque el original no lo respalde.
- El modelo base sin adaptador produce salidas que se alargan hasta el límite de longitud, como documentan los autores en un ejemplo.
- La licencia CC-BY-SA-4.0 impone compartir las obras derivadas bajo la misma licencia, lo que condiciona el uso comercial.
- Debe cargarse sobre Qwen2.5-72B base, no sobre la versión Instruct.
- El resultado BLEU registrado (50,08) es de decodificación greedy; el de beam 4 (51,41) se planificó después de conocer el greedy y no debe presentarse como el resultado principal.
- 463 de las 2.870 líneas de test aparecen literalmente en entrenamiento; las métricas sobre las 2.407 líneas no vistas (48,05 greedy) son la referencia más honesta.
- No se han publicado datos de latencia, throughput ni requisitos de VRAM específicos para este adaptador.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación por parte de la comunidad es inexistente.

## Enlaces

- Hugging Face: https://huggingface.co/Caistro-Labs/qwen2.5-72b-akkadian-en-lora
- Repositorio de la herramienta Poros: https://github.com/Caistro-Labs/poros
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-72B
- Paper referenciado: arXiv:2608.02609
