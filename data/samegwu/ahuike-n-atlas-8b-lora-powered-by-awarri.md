# SamEgwu/AHUIKE-N-ATLaS-8B-LoRA-Powered-by-Awarri

## Resumen

AHUIKE-N-ATLaS-8B-LoRA es un adaptador LoRA de tipo PEFT publicado por el usuario SamEgwu, entrenado sobre el modelo base NCAIR1/N-ATLaS (8.000 millones de parametros) y orientado a una unica tarea clinica: el triaje de signos de peligro en salud maternoinfantil. El nombre "Ahụike nne na nwa" significa "salud para la madre y el nino" en igbo. El sistema recibe una descripcion de sintomas y devuelve un unico objeto JSON con el nivel de triaje (`EMERGENCY_REFER_NOW`, `CLINIC_WITHIN_24H` o `HOME_CARE`), el grupo de paciente (nino, embarazada o posparto) y los signos de peligro del protocolo que han disparado la decision.

El modelo es relevante porque ataca un problema de despliegue muy concreto: llevar apoyo a la decision a agentes comunitarios de salud (CHEW, *Community Health Extension Workers*) y cuidadores en Nigeria, en cuatro idiomas (ingles, hausa, yoruba e igbo) y en un entorno donde un error por defecto (no derivar una emergencia) tiene consecuencias graves. Por diseno, el modelo no redacta consejos: solo emite la etiqueta de triaje y la aplicacion muestra uno de los nueve mensajes de consejo por idioma revisados por clinicos y hablantes nativos. Esto reduce la superficie de alucinacion en la salida que ve el usuario final.

La arquitectura subyacente es la del modelo base N-ATLaS-8B (iniciativa del Ministerio Federal de Comunicaciones, Innovacion y Economia Digital de Nigeria, impulsada por Awarri Technologies), sobre el que se aplica un adaptador QLoRA de rango 16 que cubre todas las proyecciones de atencion y MLP. El repositorio pesa 0,2 GB, coherente con un adaptador y no con un modelo completo, y se distribuye bajo la licencia N-ATLaS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre N-ATLaS-8B; arquitectura interna del modelo base no disponible |
| Parametros totales | Modelo base de 8B (el adaptador es un delta; numero exacto de parametros del adaptador no disponible) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible para el adaptador; el entrenamiento se realizo en QLoRA (cuantizacion en 4 bits) sobre GPUs Kaggle T4 |
| Idiomas soportados | Ingles (en), hausa (ha), yoruba (yo), igbo (ig) |
| Licencia | N-ATLaS (campo `license: other`, `license_name: n-atlas`); permite hasta 1.000 usuarios finales activos sin acuerdo adicional |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,2 GB |
| Libreria | peft (compatible con transformers) |
| Modelo base | NCAIR1/N-ATLaS |
| Casos de uso declarados | Triaje medico, salud materna, salud infantil, Nigeria |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre N-ATLaS-8B, no un modelo entrenado desde cero. El entrenamiento se hizo con QLoRA en configuracion r=16, alpha=32, aplicado a todas las proyecciones de atencion y de las capas MLP, durante 1 epoca con tasa de aprendizaje 2e-4, usando Unsloth sobre GPUs Kaggle T4. Los datos de entrenamiento son casos generados por protocolo a partir del split de entrenamiento de NaijaTriage-Bench. Cada caso aparece una sola vez y en un unico idioma (ingles, hausa, yoruba o igbo), mas variantes con cambio de codigo (*code-switching*). Las etiquetas provienen de un motor de reglas que codifica las guias WHO IMCI y las Nigerian CHEW Standing Orders, no de anotacion clinica directa.

Los textos en hausa, yoruba e igbo fueron traducidos por N-ATLaS y filtrados mediante retro-traduccion. Los autores entrenaron tambien una variante con anclaje paralelo del mismo tamano (cada caso repetido en todos los idiomas cuya traduccion superase el filtro): la precision fue identica, pero fallaba mas emergencias (9,4 % frente a 5,7 %; test de signos a nivel de caso, p = 0,019), por lo que la version publicada es la de casos diversos. En cuanto a innovaciones tecnicas, la mas relevante no es arquitectonica sino de diseno del sistema: la salida esta restringida a JSON con vocabulario cerrado de triaje, paciente y signos de peligro, y el texto de consejo que ve el usuario se sirve desde una plantilla externa revisada por clinicos y hablantes nativos. No se documentan tecnicas como decodificacion especulativa ni atencion lineal.

## Capacidades

- Clasificacion de triaje en tres niveles: `EMERGENCY_REFER_NOW`, `CLINIC_WITHIN_24H`, `HOME_CARE`.
- Identificacion del grupo de paciente: nino, embarazada o posparto.
- Extraccion de los signos de peligro del protocolo que justifican la decision (por ejemplo, `vaginal_bleeding`).
- Salida estructurada en un unico objeto JSON, pensada para ser parseada por la aplicacion (`parse_output` en `ahuike/prompts.py`).
- Multilingue en cuatro idiomas: ingles, hausa, yoruba e igbo, con soporte de entrada con cambio de codigo (81,5 % de precision en 92 elementos code-switched).
- Consistencia cross-lingue: 81,1 % de respuestas correctas y coherentes en los cuatro idiomas a la vez.
- No genera consejo medico en texto libre: por diseno, nunca escribe recomendaciones.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.

## Casos de uso

- Apoyo al triaje de agentes comunitarios de salud (CHEW) en Nigeria: el modelo recibe la descripcion de sintomas de la madre o del cuidador y devuelve el nivel de derivacion, lo que permite al agente decidir si moviliza una ambulancia o recomienda observacion, con una tasa de emergencias no detectadas del 5,7 %.
- Aplicacion movil o SMS para cuidadores: la salida JSON se mapea a uno de los nueve mensajes de consejo revisados por clinicos y traducidos, de modo que el usuario final nunca lee texto generado por el modelo.
- Triage telefonico multilingue: al cubrir ingles, hausa, yoruba e igbo, permite atender llamadas de salud maternoinfantil en la lengua del interlocutor sin depender de un traductor humano.
- Entrada con mezcla de idiomas: con un 81,5 % de precision en elementos code-switched, es utilizable en contextos urbanos nigerianos donde se alterna ingles y lengua local en la misma frase.
- Priorizacion en centros de salud con recursos limitados: el nivel de triaje y los signos de peligro detectados permiten ordenar la cola de espera por gravedad objetiva segun el protocolo.
- Investigacion en IA clinica de bajos recursos: es un punto de partida reproducible (adaptador LoRA, QLoRA, Unsloth, Kaggle T4) para estudiar ajuste fino eficiente en lenguas africanas de bajos recursos.
- Generacion de datos etiquetados para auditoria: el motor de reglas y el modelo permiten comparar etiquetas sinteticas frente a decisiones del modelo y detectar discrepancias en el protocolo.
- Formacion de personal sanitario: uso como herramienta de simulacion de casos, siempre con supervision, ya que el modelo no es un dispositivo diagnostico.

## Benchmarks y rendimiento

Resultados publicados en NaijaTriage-Bench (1.091 elementos en texto plano, 4 idiomas). Los corchetes indican intervalos de confianza del 95 % con bootstrap agrupado por caso.

| Sistema | Precision | Emergencias no detectadas (menor es mejor) | F1 de signos de peligro | Correcto y coherente en los 4 idiomas |
|---|---|---|---|---|
| N-ATLaS base | 37,2 [31,9–42,1] | 96,5 [94,5–98,2] | 23,0 | 30,5 |
| Base + 3 ejemplos resueltos | 53,8 [49,8–57,8] | 34,6 [28,8–40,7] | 30,1 | 27,4 |
| Este modelo | 90,9 [88,3–93,2] | 5,7 [2,8–9,2] | 87,1 | 81,1 |

Datos adicionales reportados por los autores:

| Metrica | Valor |
|---|---|
| Significacion frente a N-ATLaS base (McNemar exacto, todos los elementos) | p = 7,5×10⁻¹²⁷ |
| Significacion frente a N-ATLaS base (elementos de emergencia) | p = 4,3×10⁻¹³⁷ |
| Emergencias no detectadas sobre los mismos 95 casos, por idioma | Ingles 9,5; hausa 4,8; yoruba 7,1; igbo 7,1 (base: 88–100) |
| Precision en elementos igbo verificados por hablante nativo (n = 14) | 92,9 %, 0 emergencias no detectadas |
| Precision en entradas con cambio de codigo (92 elementos) | 81,5 %, 4,8 % de emergencias no detectadas |
| Sobretriaje (no emergencias derivadas un nivel por encima) | 5,7 % |

## Requisitos de hardware

- El repositorio contiene solo el adaptador (0,2 GB); para inferencia hay que cargar tambien el modelo base NCAIR1/N-ATLaS completo, cuyos requisitos de memoria son los de un modelo de 8.000 millones de parametros.
- VRAM estimada para el modelo base de 8B: aproximadamente 16 GB en FP16/BF16, en torno a 9 GB en cuantizacion de 8 bits y 5-6 GB en 4 bits. Son estimaciones derivadas del tamano del modelo base, no cifras publicadas por los autores.
- GPU recomendadas: A100 40 GB o H100 para FP16 con margen de contexto amplio; RTX 4090 (24 GB) para FP16/BF16 de un solo modelo 8B o para cuantizaciones menores con mayor longitud de contexto.
- Cabe en GPU de consumo: si, en tarjetas de 8-12 GB usando cuantizacion de 4 u 8 bits, y en 16 GB o mas sin cuantizar el modelo base. La VRAM concreta del adaptador es despreciable frente a la del base.
- Opciones de despliegue documentadas: `transformers` con `PeftModel` (ejemplo explicito en la model card). vLLM, TGI, llama.cpp u Ollama requeririan fusionar el adaptador con el modelo base y, en el caso de llama.cpp/Ollama, convertir el resultado a GGUF; no se documenta ningun procedimiento de este tipo.
- Entrenamiento: QLoRA con Unsloth sobre GPUs Kaggle T4, lo que indica que el ajuste fino del adaptador es viable en hardware de gama media con cuantizacion en 4 bits.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de otros modelos de triaje maternoinfantil en la informacion proporcionada. La unica comparativa publicada es contra el propio modelo base y su variante con ejemplos resueltos en el prompt.

| Sistema | Parametros | Contexto | Precision (NaijaTriage-Bench) | Emergencias no detectadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (LoRA sobre N-ATLaS-8B) | 8B + adaptador | No disponible | 90,9 % | 5,7 % | N-ATLaS | HuggingFace (adaptador PEFT) |
| N-ATLaS-8B base | 8B | No disponible | 37,2 % | 96,5 % | N-ATLaS | HuggingFace (NCAIR1/N-ATLaS) |
| N-ATLaS-8B base con 3 ejemplos resueltos | 8B | No disponible | 53,8 % | 34,6 % | N-ATLaS | HuggingFace (NCAIR1/N-ATLaS) |
| Otros modelos de triaje clinico comparables | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- No es un dispositivo diagnostico. Esta declarado como apoyo a la decision para agentes de salud comunitarios y cuidadores, no como sustituto de valoracion clinica.
- Entrenado y evaluado con casos sinteticos generados por un motor de reglas. Falta validacion clinica en mundo real.
- Las traducciones a hausa, yoruba e igbo las genero N-ATLaS, y la retro-traduccion no detecta todos los errores: el revisor nativo de igbo encontro errores de significado en 19 de 40 elementos muestreados.
- El modelo esta sesgado hacia la derivacion por diseno: el sobretriaje es del 5,7 %. Es un compromiso deliberado del protocolo, pero implica derivaciones innecesarias.
- Las emergencias no detectadas no son cero: 5,7 % global (intervalo 2,8-9,2) y 9,5 % en ingles, el peor idioma en este aspecto.
- El rendimiento cae en entradas con cambio de codigo (81,5 % de precision frente al 90,9 % global) y en la consistencia cross-lingue (81,1 %).
- La salida debe consumirse con el parser oficial (`parse_output`) y no como texto libre; el modelo no debe usarse para redactar consejo medico.
- Licencia N-ATLaS: permite hasta 1.000 usuarios finales activos sin acuerdo separado. Cualquier despliegue por encima de ese umbral requiere negociacion. Esta prohibido cualquier uso que la licencia N-ATLaS proscriba.
- Los autores remiten a `docs/ETHICS.md` para las simplificaciones del protocolo y las limitaciones adicionales.
- El repositorio tiene 0 descargas y 0 likes, y no se ha publicado pipeline en HuggingFace: no hay evidencia de adopcion ni de validacion independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SamEgwu/AHUIKE-N-ATLaS-8B-LoRA-Powered-by-Awarri
- Modelo base N-ATLaS: https://huggingface.co/NCAIR1/N-ATLaS
- Codigo, benchmark y resultados completos: https://github.com/EgwuSamuel/ahuike
- Awarri Technologies: https://www.awarri.com/
- Modelos y productos de IA de Awarri: https://www.awarri.com/ai-product
- Anuncio oficial del lanzamiento de N-ATLAS (FMCIDE): https://fmcide.gov.ng/nigeria-launches-landmark-ai-model-powered-by-awarri-to-advance-languages-and-ai-at-scale/
- ATLAS Umoja AI: https://www.atlasumoja.ai/
