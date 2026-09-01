# levossadtchi/emergent-interlingua

## Resumen

El repositorio `emergent-interlingua` contiene un conjunto de cuatro modelos de investigación desarrollados por Lev Ossadtchi (levossadtchi), estudiante de física y machine learning. El proyecto estudia si una misma idea expresada en distintos idiomas converge a un mismo mensaje discreto en un espacio latente, es decir, si emerge una interlingua de forma espontánea cuando se entrena un sistema únicamente con tareas de traducción. Cada modelo es un codificador-decodificador con un cuello de botella discreto de 64 ranuras (slots) y un vocabulario de 4096 símbolos, con 24 millones de parámetros. Se proporcionan cuatro variantes que difieren en una única condición experimental para permitir comparaciones controladas: un control sin intervención, una variante con división de código (SPC-16), una con recorte aleatorio de la cola (TRC-t05) y un modelo entrenado durante más pasos (L2s192000). La relevancia actual radica en su contribución a la investigación sobre comunicación emergente, representaciones discretas multilingües y alineación de lenguas sin supervisión explícita.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador-decodificador con cuello de botella discreto (64 slots × vocabulario 4096) |
| Parametros totales | 24 millones por modelo |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | en, es, pt, fr, ru, tr, vi, ar, he, ja, ko, zh (12 idiomas) |
| Licencia | MIT |
| Formato de pesos | PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura consiste en un codificador que transforma una frase en cualquiera de los doce idiomas en un mensaje discreto de 64 ranuras, cada una con un símbolo de un vocabulario de 4096 entradas, y un decodificador que reconstruye la frase en el idioma de destino. El entrenamiento se realiza exclusivamente con pares de traducción, sin ninguna alineación explícita de los códigos entre idiomas. No se especifican detalles internos como el tipo de transformer, mecanismos de atención o funciones de pérdida más allá de la tarea de traducción. No se menciona el uso de RLHF, DPO u otras técnicas de ajuste por preferencias. Las cuatro variantes comparten el mismo tamaño (24M) y el mismo programa de entrenamiento de 48 000 pasos, excepto `L2s192000` que se entrenó durante 192 000 pasos. La innovación principal es el diseño experimental: `SPC-16` declara los primeros 16 slots como una "parte común" y exige que las frases se diferencien entre sí y coincidan entre idiomas en esa parte, mientras que `TRC-t05` se entrena con recorte aleatorio de la cola, lo que lleva al modelo a inventar un alfabeto de símbolos vacíos y a desplazar el límite del mensaje según la longitud de la frase.

## Capacidades

- Traducción multilingüe entre 12 idiomas, con calidad medida mediante chrF (el mejor modelo alcanza 0.403).
- Generación de representaciones discretas (códigos de 64 símbolos) que pretenden ser independientes del idioma de entrada.
- Estudio experimental de la emergencia de una interlingua: comparación de la identidad de los códigos entre pares de idiomas para una misma idea.
- Capacidad de producir códigos con una "parte común" alineada entre idiomas en la variante SPC-16.
- No incluye capacidades de tool calling, agentes, visión, audio ni razonamiento de múltiples pasos.

## Casos de uso

- Investigación en comunicación emergente: el modelo permite estudiar cómo se alinean representaciones discretas entre idiomas sin supervisión explícita, un problema abierto en PLN multilingüe.
- Análisis de la relación entre estructura lingüística y espacio latente: los códigos generados pueden inspeccionarse para ver si ciertos símbolos se asocian consistentemente con significados o funciones gramaticales.
- Experimentos de interpretabilidad: al ser un modelo pequeño (24M), es factible analizar los mapas de activación y los símbolos discretos para comprender qué información se conserva en el cuello de botella.
- Comparación de estrategias de entrenamiento: las cuatro variantes permiten aislar el efecto de la división de código o del recorte de cola sobre la alineación interlingüe, útil para diseñar futuros métodos de regularización.
- Base para futuros sistemas de traducción con interlingua aprendida: si se demuestra que una interlingua emerge de forma fiable, podría servir como representación intermedia en pipelines de traducción multilingüe.
- Docencia y divulgación: como proyecto de código abierto con licencia MIT, es un recurso didáctico para ilustrar conceptos de comunicación emergente, cuellos de botella discretos y evaluación de representaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). La model card proporciona métricas propias del proyecto: chrF (calidad de traducción) e identidad (proporción de posiciones donde los símbolos de dos idiomas coinciden para una misma idea, corregida por control). La siguiente tabla resume los resultados de las cuatro variantes:

| Modelo | chrF | Identidad | Identidad de la parte común |
|---|---|---|---|
| TRC-ctl (control) | 0.305 | 0.155 | 0.093 |
| SPC-16 (división de código) | 0.303 | 0.190 | 0.165 |
| TRC-t05 (recorte de cola) | 0.281 | 0.137 | — |
| L2s192000 (mejor traductor) | 0.403 | 0.144 | — |

El techo de identidad medido en paráfrasis intra-idioma es de aproximadamente 0.80. La variante SPC-16 aumenta la identidad de la parte común un 77% (de 0.093 a 0.165) sin degradar la calidad de traducción, y el efecto es consistente en las 64 combinaciones de pares de idiomas.

## Requisitos de hardware

- Al tratarse de modelos de 24M de parámetros, la inferencia es viable en CPU y en cualquier GPU moderna, incluidas tarjetas de gama de entrada como GTX 1650 o RTX 3050.
- El tamaño del repositorio es de 0.4 GB, por lo que la memoria necesaria para cargar un modelo es inferior a 1 GB en precisión flotante (fp32).
- No se proporcionan datos de VRAM exacta, latencia ni throughput.
- El formato de pesos es PyTorch (.pt), por lo que el despliegue requiere un entorno con PyTorch. No se menciona compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Para reproducir los experimentos o cargar los pesos, se necesita el código del repositorio GitHub (`scripts/many.py`).

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (interlingua emergente o comunicación emergente con cuello de botella discreto). No se han encontrado referencias a otros modelos con especificaciones similares en la documentación proporcionada.

## Limitaciones y advertencias

- Proyecto de investigación personal, no diseñado para uso en producción. El autor indica que la etapa está cerrada y el trabajo en pausa.
- La calidad de traducción es limitada (chrF máximo 0.403), muy por debajo de sistemas comerciales o modelos grandes.
- No se han evaluado sesgos, robustez ni comportamientos adversos. No hay documentación sobre posibles alucinaciones o errores sistemáticos.
- La cobertura de idiomas se limita a 12 lenguas; no se garantiza un comportamiento uniforme entre ellas.
- Aunque la licencia MIT permite uso comercial, el modelo es un artefacto experimental y su uso en aplicaciones reales conlleva riesgos de calidad y fiabilidad.
- No se especifican detalles de la arquitectura interna (tipo de atención, capas, etc.), lo que dificulta la reproducción exacta sin el código fuente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/levossadtchi/emergent-interlingua
- Repositorio GitHub (código, informe y bitácora): https://github.com/Levos06/emergent-interlingua
- Perfil del autor en Hugging Face: https://huggingface.co/levossadtchi
- Portafolio del autor: https://levossadtchi.ru/
