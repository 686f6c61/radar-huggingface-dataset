# minseo25/2dsd-ouro-2.6b-thinking-dflash-drafter

## Resumen

2DSD DFlash drafter para Ouro-2.6B-Thinking es un modelo auxiliar (drafter) de decodificación especulativa diseñado específicamente para acelerar la inferencia de ByteDance/Ouro-2.6B-Thinking, un modelo de lenguaje con arquitectura de bucles (looped language model). Lo desarrolla un equipo académico vinculado a SqueezeAILab (Minseo Kim, Arnav Chavan, Amir Gholami y colaboradores, con afiliaciones a Berkeley y otras instituciones) y se publica bajo licencia Apache 2.0. No es un modelo de propósito general: su única función es proponer tokens candidatos que el modelo objetivo verifica, reduciendo el coste de decodificación sin alterar la distribución de salida.

La innovación principal es que el drafter es "depth-conditioned": un único conjunto de 5 capas Transformer con ancho oculto 2048 sirve para los cuatro niveles de bucle (r = 1 a 4) del modelo objetivo, en lugar de requerir un drafter distinto por profundidad. Esto se logra combinando características ocultas extraídas de cinco capas concretas del target (índices 1, 12, 23, 34 y 45 de 48) en cada bucle, junto con un embedding de máscara aprendido y los embeddings y la cabeza LM congelados del modelo base.

El resultado es un artefacto de 378,5 millones de parámetros (0,8 GB en safetensors) que, según el paper asociado, permite decodificación especulativa en modelos con bucles manteniendo exactamente las salidas greedy y la distribución de muestreo del target. Es relevante para quienes despliegan Ouro-2.6B-Thinking en producción y buscan reducir latencia sin reentrenar ni modificar el modelo principal, aunque su utilidad queda circunscrita al ecosistema 2DSD.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer drafter de 5 capas, depth-conditioned, para decodificacion especulativa (DFlash) sobre modelo objetivo con bucles |
| Parametros totales | 378.561.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | ByteDance/Ouro-2.6B-Thinking |
| Tamano del repositorio | 0,8 GB |
| Ancho oculto | 2048 |
| Block size (k) | 16 |
| Profundidades de bucle soportadas (R) | 4 (r = 1, 2, 3, 4) |
| Capas del target usadas como contexto | 1, 12, 23, 34, 45 (de 48) |
| Embeddings y LM head | Congelados del target; embedding de mascara aprendido |
| Descargas en Hugging Face | 6 |
| Fecha de creacion | 2026-11-16 |

## Arquitectura y entrenamiento

El drafter es un Transformer de 5 capas con el mismo ancho oculto que el modelo objetivo (2048). En cada paso de drafting en el bucle r, recibe como contexto una combinacion de caracteristicas del bucle R (el ultimo, ya comprometido) para los tokens confirmados y del bucle r para los tokens en vuelo, extraidas de cinco capas del target (índices 1, 12, 23, 34 y 45 de 48). Reutiliza los embeddings de entrada y la cabeza LM congelados del modelo base, y solo aprende un embedding de mascara adicional. Un unico drafter cubre todas las profundidades de bucle, lo que evita mantener R drafters separados.

El entrenamiento se realizo sobre rollouts de 13.000 prompts durante seis epocas, con block size 16 y profundidades de entrenamiento r en {1, 2, 3, 4} muestreadas con probabilidades (0,5; 0,125; 0,125; 0,25). No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni si se emplearon tecnicas de RLHF o DPO (no aplicables a un drafter de este tipo). La verificacion se realiza con el ultimo bucle del target, de modo que se preservan las salidas greedy y la distribucion de muestreo originales.

## Capacidades

- Generacion especulativa de tokens candidatos (drafting) para el modelo objetivo Ouro-2.6B-Thinking.
- Aceleracion de decodificacion en modelos con arquitectura de bucles mediante un unico drafter depth-conditioned.
- Preservacion exacta de las salidas greedy del target y de su distribucion de muestreo (verificacion con el ultimo bucle).
- Soporte de decodificacion greedy por defecto y de muestreo con temperatura y top-p.
- No es un modelo de chat, razonamiento, codigo ni vision por si mismo: hereda las capacidades del target solo en la medida en que propone tokens que este verifica.
- No dispone de tool calling, function calling, capacidades de agente ni modo thinking propios.
- Capacidades multilingues: no disponibles de forma independiente; dependen del target.

## Casos de uso

- Aceleracion de inferencia en produccion de Ouro-2.6B-Thinking: el drafter propone hasta 16 tokens por paso (block size k = 16) que el target verifica en un unico forward, reduciendo el numero de pasos de decodificacion en cargas interactivas.
- Servicio de chat de baja latencia: al preservar la distribucion del target, puede desplegarse detras de una API de generacion de texto sin cambiar la calidad percibida por el usuario, solo el tiempo de respuesta.
- Generacion de codigo asistida: integrado en pipelines que ya usan Ouro-2.6B-Thinking para completar codigo, reduce el coste por token generado en IDE o CI/CD sin alterar las sugerencias.
- Razonamiento matematico en modo thinking: el ejemplo de la model card (suma de los primeros 100 enteros) ilustra su uso en tareas de razonamiento donde el target genera cadenas largas y la aceleracion por bloque resulta mas rentable.
- Evaluacion comparativa de tecnicas de decodificacion especulativa: sirve como referencia reproducible para investigadores que comparan 2DSD con otras tecnicas (Medusa, EAGLE, drafters clasicos) sobre modelos con bucles.
- Investigacion sobre arquitecturas looped: permite estudiar el comportamiento de un drafter compartido entre profundidades de bucle, un escenario poco explorado en la literatura de decodificacion especulativa.
- Despliegue en entornos con GPU limitada: con 378,5 M de parametros y 0,8 GB de pesos, el drafter anade una sobrecarga de memoria modesta frente al target de 2,6 B, lo que facilita su inclusion en infraestructuras existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper 2DSD para las metricas de aceleracion (speedup) y calidad, pero no incluye cifras numericas en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para el drafter: aproximadamente 0,8 GB en safetensors (pesos en precision original); el consumo real depende de la precision de carga y del runtime.
- VRAM adicional del target: el modelo objetivo Ouro-2.6B-Thinking requiere su propia memoria (no cuantificada en la informacion disponible), a la que se suma la del drafter y las activaciones.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, el drafter es compatible con GPU consumer (RTX 4090, RTX 3090) y con A100/H100 en despliegues de mayor concurrencia.
- Cabe en GPU consumer: si, el drafter por si solo; el conjunto target + drafter depende del target.
- Opciones de despliegue: el unico runtime documentado es el repositorio SqueezeAILab/2DSD (`scripts/generate.py --model ouro-2.6b-thinking --target original`). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles; el paper 2DSD es la referencia para las cifras de aceleracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 2DSD DFlash drafter (este) | 378,5 M | no disponible | Drafter especulativo depth-conditioned para Ouro-2.6B-Thinking | Apache 2.0 | Hugging Face (6 descargas) |
| Ouro-2.6B-Thinking (target) | 2,6 B (nominal) | no disponible | Modelo de lenguaje con bucles y modo thinking | Apache 2.0 | Hugging Face (ByteDance) |
| Drafters especulativos genericos (Medusa, EAGLE) | variable | no disponible | Aceleracion de decodificacion en transformers estandar | variable | multiples repositorios |

La comparacion directa con otros drafters no es posible con los datos disponibles: no se han publicado cifras de speedup ni de tasa de aceptacion en la informacion proporcionada. La diferencia estructural frente a Medusa o EAGLE es el condicionamiento por profundidad de bucle, que permite un unico drafter para R = 4.

## Limitaciones y advertencias

- Uso restringido: solo funciona con Ouro-2.6B-Thinking y el runtime 2DSD; no es un modelo autonomo ni sustituible por otro target.
- Dependencia de la version del target: cambios en el modelo base o en la configuracion de bucles pueden invalidar el drafter.
- Sin datos publicos de rendimiento en la ficha: no hay cifras de speedup, tasa de aceptacion ni latencia que permitan estimar el beneficio real.
- Riesgo de alucinacion: heredado del target; el drafter no lo corrige, solo acelera la generacion verificada.
- Sesgos: no documentados de forma independiente; los del target se propagan.
- Idiomas: no disponibles; dependen del target.
- Contexto maximo: no disponible.
- Licencia Apache 2.0 permite uso comercial, pero el drafter incluye una copia de la cabeza LM del target, por lo que se deben respetar tambien las condiciones de ByteDance/Ouro-2.6B-Thinking.
- Madurez: 6 descargas y 0 likes en el momento de la ficha; proyecto de investigacion, no un artefacto con soporte de produccion.
- No se documentan cuantizaciones ni integracion con servidores de inferencia habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/minseo25/2dsd-ouro-2.6b-thinking-dflash-drafter
- Modelo base: https://huggingface.co/ByteDance/Ouro-2.6B-Thinking
- Paper 2DSD: https://github.com/SqueezeAILab/2DSD/blob/main/paper/2DSD.pdf
- Codigo: https://github.com/SqueezeAILab/2DSD
