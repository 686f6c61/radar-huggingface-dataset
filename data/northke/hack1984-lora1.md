# NorthKE/hack1984-lora1

## Resumen

hack1984-lora1 es un adaptador LoRA publicado por el usuario NorthKE sobre el modelo base unsloth/Qwen3.5-2B. No se trata de un modelo de propósito general, sino de un etiquetador especializado creado para la pista 1 ("Signal-to-Dose") del hackathon HACK1984, celebrado en Boston los días 7 y 8 de noviembre de 2026. Su función concreta es etiquetar evidencia pública sobre dos fármacos oncológicos de pulmón, asignando tipo de señal, carácter accionable y cinco aspectos adicionales.

El modelo se distribuye en dos formatos: un GGUF con el adaptador ya fusionado y cuantizado a Q8_0 (2,0 GB), que es el artefacto que consume el pipeline, y el adaptador LoRA en formato PEFT con su tokenizador, pensado para aplicarse sobre el modelo base. El diseño apunta a un despliegue completamente offline sobre un servidor llama.cpp autoalojado, sin dependencia de red durante la ejecución.

Por su tamaño (1.942.653.248 parámetros en los pesos publicados) y su naturaleza de adaptador de tarea, el interés es acotado: resulta relevante como ejemplo de especialización de un modelo pequeño de 2B para una tarea de extracción estructurada en dominio biomédico, y como pieza reproducible de un pipeline de hackathon con verificación de integridad mediante sha256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-2B); adaptador LoRA sobre atención y proyecciones del modelo base |
| Parametros totales | 1.942.653.248 (pesos publicados en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (GGUF publicado); el adaptador PEFT se puede cuantizar a otros formatos vía llama.cpp, no documentado |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT), GGUF Q8_0 (modelo fusionado) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre unsloth/Qwen3.5-2B, un transformer decoder-only de aproximadamente 2.000 millones de parámetros. La publicación incluye únicamente los pesos LoRA en formato PEFT junto con el tokenizador, más una versión fusionada y cuantizada a Q8_0 en GGUF para su uso directo con llama.cpp. No se documenta la configuración del adaptador (rango, alpha, módulos objetivo) ni la arquitectura interna del modelo base más allá de su identificador.

En cuanto a los datos, la model card indica que el entrenamiento utilizó exclusivamente ítems públicos y sin etiquetar de la pista, y que no se emplearon ítems de test. No se especifica el número de tokens, la composición del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento posterior al ajuste supervisado. Tampoco se detalla ninguna innovación técnica adicional (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Etiquetado de evidencia pública sobre dos fármacos oncológicos de pulmón, con asignación de tipo de señal y carácter accionable.
- Extracción de cinco aspectos adicionales por ítem, según la definición de la pista "Signal-to-Dose".
- Ejecución offline sobre un servidor llama.cpp autoalojado, sin acceso a red durante la inferencia.
- Distribución en dos modalidades: GGUF fusionado listo para servir y adaptador PEFT para aplicar sobre el modelo base.
- Integridad verificable mediante sha256 del archivo GGUF publicado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Etiquetado de señales farmacovigilantes: el modelo procesa textos de evidencia pública sobre los dos fármacos objetivo y devuelve tipo de señal y flag accionable, lo que permite clasificar lotes de documentos sin intervención manual.
- Pipeline de hackathon reproducible: el archivo GGUF se coloca en `drug track/models/lora1-q8_0.gguf`, se verifica el sha256 y se ejecuta `drug track/RUN.md`, de modo que cualquier equipo puede replicar el flujo exacto del track 1.
- Procesamiento en entornos sin conectividad: al ejecutarse sobre llama.cpp local, encaja en despliegues con requisitos de aislamiento de red, como laboratorios o entornos regulados.
- Extracción estructurada de aspectos: los cinco aspectos por ítem permiten construir tablas normalizadas de evidencia que alimenten un sistema de revisión o un cuadro de mando farmacológico.
- Prototipado rápido de clasificadores de dominio: al ser un adaptador PEFT sobre un base de 2B, sirve como plantilla para adaptar Qwen3.5-2B a otras tareas de etiquetado con presupuesto de cómputo reducido.
- Evaluación comparativa de estrategias de ajuste: al publicarse tanto el adaptador como el modelo fusionado cuantizado, permite medir la diferencia de comportamiento entre servir el LoRA por separado y servir el GGUF fusionado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el GGUF Q8_0 ocupa 2,0 GB en disco, por lo que la inferencia requiere aproximadamente 2,5-3 GB de memoria considerando overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; tarjetas consumer como RTX 3060, RTX 4060 o superiores son suficientes. Para servir el adaptador PEFT sin fusionar sobre el modelo base en fp16 se necesitan en torno a 4-5 GB.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 4 GB o más; también es viable en CPU.
- Opciones de despliegue: llama.cpp / llama-server (el flujo documentado por el autor), y por extensión otros runtimes compatibles con GGUF. El adaptador PEFT requiere un stack de la librería peft sobre el modelo base.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| NorthKE/hack1984-lora1 | 1.942.653.248 | no disponible | no disponible | safetensors (PEFT), GGUF Q8_0 | Adaptador de tarea para etiquetado oncológico |
| unsloth/Qwen3.5-2B | ~2B | no disponible | no disponible | safetensors | Modelo base sin especializar |
| Adaptadores LoRA de dominio público sobre modelos de 2B | variable | variable | variable | PEFT, GGUF | Alternativas genéricas; no se dispone de comparación directa publicada |

No se dispone de datos de rendimiento que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está especializado en una única tarea (etiquetado de evidencia sobre dos fármacos de cáncer de pulmón); su uso fuera de ese dominio no está validado.
- No se documentan sesgos conocidos, pero al entrenarse solo con ítems públicos de una pista concreta, la distribución de entrenamiento es estrecha y puede no generalizar.
- Riesgo de alucinación inherente a un modelo de 2B ajustado con LoRA; las etiquetas generadas deben validarse antes de cualquier uso clínico o regulatorio.
- La licencia no está declarada, lo que impide confirmar si se permite uso comercial; debe contactarse con el autor antes de cualquier despliegue productivo.
- No se especifican idiomas soportados ni longitud de contexto; el comportamiento multilingüe es desconocido.
- El modelo base referenciado (unsloth/Qwen3.5-2B) debe verificarse y obtenerse por separado si se usa el adaptador PEFT en lugar del GGUF fusionado.
- El repositorio registra 0 descargas y 0 likes, sin evidencia de uso o validación por terceros.
- La fecha de creación indicada (2026-11-08) corresponde al evento del hackathon; conviene confirmar la vigencia de los artefactos antes de integrarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NorthKE/hack1984-lora1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-2B
- Página del hackathon HACK1984: https://claudeneu.com/hackathon/
- Tavily: https://tavily.com
- Exa: https://exa.ai
