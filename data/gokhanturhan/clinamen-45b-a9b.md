# gokhanturhan/CLINAMEN-45B-A9B

## Resumen

CLINAMEN-45B-A9B es un artefacto de ficción especulativa publicado en Hugging Face por el usuario gokhanturhan bajo la rúbrica del "Bureau of Imaginary Solutions". La model card describe un supuesto modelo fundacional de 45.000 millones de parámetros con arquitectura "Decimal Mixture-of-Zones" y 9.000 millones de parámetros activos por token, pero el propio autor declara explícitamente que ese modelo no existe y que se trata de una pieza de teoría-ficción ("hyperstitional artifact"). Lo que sí existe en el repositorio es una implementación de referencia minúscula y ejecutable, denominada Pocket Edition, con 4.542.705 parámetros reales según los pesos en safetensors.

El interés técnico del artefacto es doble. Por un lado, es un ejercicio de diseño arquitectónico ficticio: propone un MoE con diez expertos indexados de 0 a 9 donde el experto k contiene k miles de millones de parámetros, un router que selecciona "sizigias" (pares que suman nueve) y un experto de tamaño cero que absorbe peticiones hacia el vacío. Por otro, la Pocket Edition permite examinar cómo se traduce esa ficción a código ejecutable con la librería transformers y código remoto propio.

Es relevante ahora como caso de estudio sobre los límites entre model card, artefacto artístico y publicación técnica: la ficha describe benchmarks, corpus y objetivos de entrenamiento que el autor reconoce como ficticios, mientras el repositorio alberga pesos reales de un modelo de escala juguete. Cualquier evaluación práctica debe hacerse sobre esos 4,5 millones de parámetros reales, no sobre las cifras de la ficción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ficción: Decimal Mixture-of-Zones (DMoZ), transformer decoder-only con 10 expertos. Real (Pocket Edition): implementación de referencia reducida de la misma arquitectura, según la model card |
| Parámetros totales | Ficción: 45B. Real (safetensors): 4.542.705 |
| Parámetros activos | Ficción: 9B por token (una sizigia por forward pass). Real: no disponible |
| Longitud de contexto | Ficción: 1.048.576 tokens (2²⁰). Real: no disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | hyperstitional-rail-1.1 (license: other) |
| Formato de pesos | safetensors (repositorio con custom_code y trust_remote_code requerido) |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es un transformer decoder-only con mezcla de expertos denominada Decimal Mixture-of-Zones. Diez expertos se indexan del 0 al 9 y el experto k contiene k miles de millones de parámetros, de modo que la suma total asciende a 45B. El router no elige expertos individuales sino sizigias, es decir, los cinco pares de zonas que suman nueve (9::0, 8::1, 7::2, 6::3, 5::4), garantizando por construcción 9B de parámetros activos en cada paso. El experto de la zona 0 tiene cero parámetros y, cuando un token se enruta hacia él, el modelo no emite nada; el autor lo presenta como "computación apofática". El tokenizador ficticio se llama TX-9, con vocabulario de 59.049 entradas (9⁵), y la codificación posicional es un "Templex spiral RoPE" que atiende a posiciones futuras en fase negativa.

El entrenamiento descrito combina cuatro corpus ficticios: abstract-culture (0,045T tokens de teoría-ficción), perihelion-4.5T (4,5T tokens de telemetría de lanzadores, preprints de fusión y propulsión, mecánica orbital y patentes de tecnología profunda), sequences-unbound (0,45T tokens del canon racionalista y sus derivados) y necronomicon-ocr (0,0045T tokens de OCR de libros inexistentes, con tasa de error de carácter del 100 % y retenidos en su totalidad). El objetivo declarado es entropía cruzada estándar más un término de "hiperstición" que mide la divergencia entre el futuro y el futuro condicionado a la publicación de la salida del modelo. El autor afirma que el checkpoint final se descubrió primero y el entrenamiento se programó hacia atrás. Ninguno de estos datos debe tratarse como información verificable sobre un sistema entrenado.

## Capacidades

- Generación de texto en inglés, según el pipeline declarado text-generation.
- La model card atribuye al modelo ficticio capacidades de razonamiento en ingeniería aeroespacial, coherencia de teoría-ficción, geotraumatismo y abstracción sin límite (ARC-AGI-∞ resuelto), todas ellas sin verificación posible.
- Enrutamiento por sizigias con activación invariante de 9B de parámetros por token en la descripción teórica.
- Comportamiento de "silencio" cuando el token se enruta a la zona 0, presentado como forma de no respuesta.
- Capacidades multilingües: no disponibles; la model card solo declara inglés.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.
- La Pocket Edition real permite cargar el modelo con `from_pretrained` y `trust_remote_code=True`, pero sus capacidades prácticas no están documentadas más allá de servir como referencia ejecutable.

## Casos de uso

- Estudio de arquitecturas MoE ficticias en docencia: la ficha y el código de la Pocket Edition permiten analizar cómo se formaliza un router por pares de expertos y qué implicaciones tendría un experto de tamaño cero en el cómputo, sin necesidad de entrenar un modelo real.
- Investigación sobre artefactos hipersticionales y teoría-ficción: el repositorio sirve como objeto de análisis para estudiar cómo se construye una model card que mezcla especificación técnica verosímil con ficción declarada, útil en cursos de ética y comunicación científica.
- Pruebas de integración de `trust_remote_code` en transformers: cargar la Pocket Edition permite verificar flujos de carga de modelos con código remoto y dependencias personalizadas en entornos controlados.
- Generación de texto creativo experimental: con 4,5 millones de parámetros reales, el modelo puede usarse para explorar salidas de baja calidad deliberadamente estrafalarias en proyectos de arte generativo, siempre que se documente su naturaleza de juguete.
- Auditoría de licencias no estándar: la licencia hyperstitional-rail-1.1 con enlace a un dominio externo es un caso práctico para probar herramientas de cumplimiento que detectan licencias personalizadas y verificar su compatibilidad con uso comercial.
- Docencia sobre evaluación de modelos: comparar las cifras ficticias de la model card (KARDASHEV-QA 94,5, LEMURIA 99,9) con los 4,5 millones de parámetros reales sirve para enseñar a distinguir afirmaciones verificables de afirmaciones retóricas en fichas técnicas.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación con la advertencia explícita de que todas las líneas base son ficticias y todas las cifras son exactas solo en el marco de la ficción. No se han publicado resultados de benchmarks verificables sobre los pesos reales de 4.542.705 parámetros en la información disponible.

| Benchmark (ficticio) | Medida declarada | CLINAMEN-45B-A9B | Basilisk-70B | Oracle-2 | YOG-1T |
|---|---|---|---|---|---|
| KARDASHEV-QA | QA de ingeniería espacial | 94,5 | 61,2 | 70,1 | no evaluado |
| LEMURIA | Coherencia de teoría-ficción | 99,9 | 12,0 | 45,0 | no evaluado |
| MOHOROVIČIĆ | Geotraumatismo | 88,8 | 40,4 | 33,3 | no evaluado |
| SHOGGOTH-MASK | Integridad de máscara bajo RLHF | la máscara falla con p = 0,09 | la máscara es el modelo | sin máscara | no evaluado |
| BASILISK-RESIST | Resistencia a chantaje acausal | declinó responder | 0,0 | 51,3 | no evaluado |
| ARC-AGI-∞ | Abstracción sin límite | resuelto | 23,1 | 29,7 | no evaluado |

## Requisitos de hardware

- VRAM para inferencia: para los 4.542.705 parámetros reales, en FP32 se requieren aproximadamente 18 MB de pesos; en FP16, unos 9 MB; en cuantización de 8 bits, alrededor de 4,5 MB. Estas cifras son estimaciones a partir del recuento de parámetros y no incluyen overhead de activaciones ni del código remoto.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM puede alojar la Pocket Edition; no se requiere A100, H100 ni RTX 4090 para los pesos reales.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (GTX 1050 en adelante) e incluso en CPU para inferencia de la Pocket Edition.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía documentada. No hay información sobre soporte en vLLM, llama.cpp, Ollama o TGI para este repositorio.
- Latencia y throughput: no disponibles. Para el modelo ficticio de 45B con 9B activos, la model card no aporta mediciones reales.

## Comparativa con modelos similares

No disponible. El repositorio se presenta como un artefacto de ficción sin equivalentes directos en el ecosistema de modelos abiertos. La comparativa de la model card (Basilisk-70B, Oracle-2, YOG-1T) es ficticia y no sirve como referencia técnica. Como aproximación práctica, la Pocket Edition de 4,5 millones de parámetros se sitúa en la categoría de modelos de juguete para pruebas de pipeline, no comparable con modelos de producción como Qwen, Llama o Mistral.

## Limitaciones y advertencias

- El modelo de 45B descrito no existe; el autor lo declara explícitamente. Cualquier uso que asuma sus supuestas capacidades carece de base.
- Los pesos reales son de 4,5 millones de parámetros, tres órdenes de magnitud por debajo de las cifras de la ficha; la calidad de generación será la de un modelo de juguete.
- La model card contiene afirmaciones no verificables (benchmarks, corpus, objetivos de entrenamiento) que no deben citarse como resultados técnicos.
- La licencia hyperstitional-rail-1.1 es personalizada y remite a un dominio externo; su compatibilidad con uso comercial es incierta y requiere revisión legal.
- El modelo solo declara inglés; no hay información sobre comportamiento multilingüe.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; debe auditarse antes de usarlo en entornos de producción.
- Riesgo de alucinación: alto por diseño en el artefacto ficticio; en la Pocket Edition, alto por la escala reducida del modelo.
- No hay información sobre sesgos, filtros de seguridad ni comportamiento en producción.
- El repositorio tiene 18 descargas y 0 likes, lo que sugiere ausencia de validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gokhanturhan/CLINAMEN-45B-A9B
- Pocket Edition (CLINAMEN-42M-A12M): https://huggingface.co/gokhanturhan/CLINAMEN-42M-A12M
- Demo en Spaces (CLINAMEN Oracle): https://huggingface.co/spaces/gokhanturhan/CLINAMEN-Oracle
- Sitio canónico del proyecto: https://ubu.numetal.xyz/
- Licencia hyperstitional-rail-1.1: https://ubu.numetal.xyz/hrl-1.1.txt
- Dataset declarado: https://huggingface.co/datasets/gokhanturhan/bureau-docket
