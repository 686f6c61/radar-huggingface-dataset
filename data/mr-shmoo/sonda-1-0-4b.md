# Mr-Shmoo/sonda-1.0-4B

## Resumen

sonda-1.0-4B es un modelo de decisión de 4.205.751.296 parámetros (unos 4,2 B) publicado por el usuario Mr-Shmoo en HuggingFace bajo licencia Apache-2.0. No es un modelo conversacional ni de generación de texto, pese a que el pipeline declarado sea `text-generation`: recibe evidencia (`state`) y una pregunta tipada —sí/no (`noul`), elección o puntuación— junto con sus opciones, y devuelve en una única pasada hacia delante una probabilidad calibrada por opción, sin generar tokens. La salida se lee directamente de los logits de las letras de las opciones y se ajusta con temperaturas por tipo de pregunta definidas en la configuración del servidor.

El modelo deriva de la familia Qwen3.5-4B: parte de `alibiserikbay/JevK5` (Qwen3.5-4B más LoRA fusionado), pasa por `sonda-0.1` y llega a `sonda-1.0` mediante una segunda fusión de LoRA. Está entrenado exclusivamente en polaco e inglés (etiquetas de idioma `pl` y `en`) y está pensado para desplegarse con `sonda-server`, un servidor Apache-2.0 que expone la API TypeSafe `/v1/systemone`.

Su relevancia reside en el enfoque: en lugar de un LLM generativo que razona en lenguaje natural, ofrece clasificación y estimación de probabilidad calibrada en un solo paso, con una ECE muy baja (0,028 en inglés y 0,027 en polaco) en el conjunto de evaluación propio del autor, lo que lo hace útil para enrutado, triaje y verificación de reglas donde importa la fiabilidad de la probabilidad, no la fluidez del texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (etiqueta de arquitectura `qwen3_5_text`), derivado de Qwen3.5-4B |
| Parametros totales | 4.205.751.296 (4,2 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en safetensors, sin cuantizaciones GGUF/AWQ/GPTQ declaradas) |
| Idiomas soportados | Polaco (pl) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 8,4 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen3.5 (etiqueta `qwen3_5_text`) con unos 4,2 B de parámetros. No es un modelo MoE ni híbrido SSM, y no se documenta ninguna innovación de decodificación especulativa ni atención lineal. La particularidad funcional está en la cabeza de lectura: en lugar de generar texto, el modelo produce una probabilidad calibrada por opción leyendo los logits de las letras de las opciones en una sola pasada, siguiendo el prompt de decisión y el readout de una pasada adaptados de SemIf (MIT). La calibración se aplica a posteriori con temperaturas por tipo de pregunta.

El entrenamiento se realizó en dos fases documentadas. `sonda-0.1` se entrenó con 34.901 registros (conjunto de preguntas en inglés y polaco) y `sonda-1.0` añadió 1.929 registros adicionales sobre el anterior, en ambos casos mediante LoRA entrenado y fusionado con los pesos base. La ascendencia declarada es: base Qwen3.5-4B (Qwen team, Apache-2.0) → JevK5 v0.2 (`alibiserikbay/JevK5`, Qwen3.5-4B + LoRA fusionado, Apache-2.0) → sonda-0.1 → sonda-1.0. No se especifica la composición exacta del dataset, el número total de tokens ni si se empleó RLHF o DPO.

## Capacidades

- Decisión binaria (`noul`): devuelve P(sí) para una instrucción verificable sobre el estado proporcionado.
- Elección entre opciones (`choice`): devuelve un vector de probabilidades sobre un conjunto de alternativas.
- Puntuación (`score`): devuelve un nivel esperado junto con su distribución de probabilidades.
- Inferencia en una sola pasada hacia delante, sin generación de tokens en la respuesta.
- Calibración por tipo de pregunta mediante temperaturas configurables (`sonda.conf` / `sonda.json`).
- Lectura de hasta 16 opciones por pasada; los runtimes pueden combinar varias pasadas para listas mayores.
- Comparación de valores y aplicación de reglas definidas sobre la evidencia.
- Soporte bilingüe polaco e inglés.
- Exposición mediante API TypeSafe `/v1/systemone` en `sonda-server`.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (el diseño es de decisión en una pasada).
- Modo "thinking", visión o audio: no disponible (no documentado).

## Casos de uso

- Triaje de tickets de soporte: enviar el texto del ticket como `state` y una pregunta `noul` del tipo "el cliente solicita un reembolso, no una sustitución" para enrutar automáticamente al equipo correcto con una probabilidad calibrada.
- Enrutado de solicitudes con etiquetas cerradas: usar el tipo `choice` para clasificar la intención entre un conjunto fijo de categorías (facturación, envío, devoluciones) y aplicar un umbral de confianza antes de derivar a humano.
- Verificación de reglas de negocio: comprobar si un caso cumple una política (por ejemplo, elegibilidad de una promoción) comparando los valores ya calculados y presentes en el `state`.
- Priorización de riesgo: emplear el tipo `score` para asignar un nivel esperado (bajo, medio, alto) a casos de fraude o impago, aprovechando el ECE bajo (0,027–0,028) para priorizar revisiones.
- Moderación con probabilidad explícita: clasificar contenido como conforme o no conforme mediante `noul`, usando la probabilidad como señal de confianza en lugar de una etiqueta dura.
- Preanotación para revisión humana: generar etiquetas y probabilidades sobre lotes de documentos en polaco e inglés, dejando los casos de menor confianza a revisión manual, dado el bajo error de calibración.
- Análisis de satisfacción con escala ordinal: aplicar el tipo `score` a comentarios de clientes para obtener una distribución sobre niveles en lugar de una única nota.
- Automatización de flujos documentales con evidencia larga: enviar el estado completo del expediente y varias preguntas tipadas en una misma llamada al servidor para poblar campos estructurados.

## Benchmarks y rendimiento

PriorBench Jev cases (`priorbench/jev`, MIT; 2.853 peticiones distintas con respuesta definida por reglas; 2 de octubre de 2026; servido por sonda-server). El modelo solo se entrenó en polaco e inglés, por lo que el francés queda fuera de sus idiomas de entrenamiento.

| Modelo | Idioma | Registros | Accuracy | NLL | ECE |
|---|---|---|---|---|---|
| jev | Inglés | 120 | 98,3 % | 0,048 | 0,027 |
| sonda-1.0 | Inglés | 120 | 97,5 % | 0,096 | 0,025 |

Conjunto de evaluación propio del autor en polaco e inglés: 327 + 327 preguntas de decisión (sí/no, elección y puntuación; versiones en polaco e inglés de los mismos casos, los mismos registros para todos los modelos). Puntuación = 100 × (0,5 · accuracy + 0,3 · e^−NLL + 0,2 · (1 − ECE)), promediada sobre las celdas idioma × tipo de pregunta.

| Modelo | Accuracy EN | Accuracy PL | NLL EN / PL | ECE EN / PL | Puntuación |
|---|---|---|---|---|---|
| Jev (`jev-latest`, API TypeSafe, 1 de octubre de 2026) | 99,1 % | 97,9 % | 0,068 / 0,082 | 0,046 / 0,047 | 95,9 |
| sonda-pl-1.0 (este modelo) | 97,2 % | 95,4 % | 0,101 / 0,138 | 0,028 / 0,027 | 93,4 |
| JevK5 v0.3.3 (`alibiserikbay/JevK5`) | 93,3 % | 92,4 % | 0,159 / 0,213 | 0,073 / 0,065 | 87,7 |

Nota del autor: Jev es el modelo alojado de TypeSafe (versión vigente en la fecha indicada) y reporta probabilidades redondeadas a dos decimales, lo que afecta ligeramente a su NLL y ECE.

## Requisitos de hardware

- VRAM estimada: aproximadamente 10 GB de memoria de GPU según el README del autor para servir el modelo con `sonda-server`.
- Requisitos de sistema del servidor: Linux con GPU NVIDIA y CUDA, Python 3.11 o superior.
- Pesos en safetensors de 8,4 GB, compatibles con una GPU de consumo: cabe en RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080/4070 Ti Super (16 GB) y, al filo del límite, en GPUs de 12 GB si el runtime no exige el pico de 10 GB documentado más overhead.
- Opciones de despliegue: `sonda-server` (Apache-2.0) con PyTorch y transformers; el servidor incluye ejemplos en `http://localhost:8090/`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Accuracy EN / PL | ECE EN / PL | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| sonda-1.0-4B (este modelo) | 4,2 B | pl, en | 97,2 % / 95,4 % | 0,028 / 0,027 | Apache-2.0 | Pesos en HuggingFace, servidor sonda-server |
| JevK5 v0.3.3 (`alibiserikbay/JevK5`) | no disponible | pl, en | 93,3 % / 92,4 % | 0,073 / 0,065 | Apache-2.0 (según la tabla de linaje) | Pesos en HuggingFace |
| Jev (`jev-latest`) | no disponible | no disponible (evaluado en EN y PL) | 99,1 % / 97,9 % | 0,046 / 0,047 | no disponible | Modelo alojado por TypeSafe vía API TypeSafe |

## Limitaciones y advertencias

- Sin aritmética: el modelo no suma, divide, convierte unidades ni cuenta días. Los valores derivados (totales, importes por persona, fechas) deben calcularse en el código y enviarse ya resueltos dentro del `state`.
- Conteo de palabras en listas: rendimiento débil, en torno al 40–67 % en PriorBench según el propio autor.
- Idiomas: entrenado únicamente en polaco e inglés. Otros idiomas funcionan solo parcialmente (el francés queda explícitamente fuera, según el README).
- Listas de opciones largas: una pasada lee como máximo 16 opciones; para más alternativas hay que combinar varias pasadas desde el runtime.
- No es un modelo de chat ni de generación de texto: usarlo como LLM conversacional no es su propósito declarado, aunque la etiqueta del pipeline sea `text-generation`.
- Alucinación y calibración fuera de dominio: la probabilidad está calibrada en el conjunto de evaluación del autor; no hay garantía de calibración en dominios distintos a los de entrenamiento.
- Sesgos conocidos: no se documentan sesgos específicos en la información disponible.
- Licencia: Apache-2.0, permite uso comercial. Es obligatorio conservar `LICENSE` y `NOTICE` con los pesos; "Qwen" y "JevK5" indican el origen del modelo, no este producto.
- Atribuciones obligatorias: Qwen3.5-4B (Qwen team, Apache-2.0), JevK5 (sus autores, Apache-2.0) y el prompt de decisión y readout de una pasada adaptados de SemIf (TheoLeeCJ, MIT).
- Madurez: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta; los resultados de evaluación son mayoritariamente autoinformados por el autor.
- Caveat de producción: el modelo requiere el servidor `sonda-server` para interpretar los logits de las letras de las opciones y aplicar las temperaturas; no es un uso directo con `transformers` sin esa capa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mr-Shmoo/sonda-1.0-4B
- Modelo base: https://huggingface.co/alibiserikbay/JevK5
- Servidor de inferencia sonda-server (Apache-2.0): https://github.com/sonda-ml/sonda-server
- Conjunto de evaluación PriorBench Jev (MIT): https://github.com/priorbench/jev
