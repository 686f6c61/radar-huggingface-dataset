# AmplifiedAccess/Luganda-gemma-1b-it

## Resumen

Luganda-gemma-1b-it es un adaptador LoRA (QLoRA) publicado por AmplifiedAccess sobre el modelo base google/gemma-3-1b-it, orientado a traduccion bidireccional ingles-luganda y a conversacion en luganda. El luganda es una lengua bantu hablada principalmente en Uganda con recursos digitales muy limitados, por lo que el modelo aborda el problema de la traduccion automatica de calidad en un par de idiomas de bajos recursos donde los sistemas genericos rinden muy por debajo de lo aceptable.

El modelo no introduce una arquitectura nueva: hereda el transformer decoder-only de Gemma 3 1B Instruct (aproximadamente 1.000 millones de parametros) y anade un adaptador de solo 52 MB, con 13,05 millones de parametros entrenables (2,0 % del total). Se entreno con QLoRA en 4 bits NF4 durante una epoca sobre unos 94.542 ejemplos derivados de aproximadamente 24.000 pares de frases paralelas del corpus Sunbird SALT, en unas 8 horas sobre una unica Tesla T4.

Su relevancia actual es practica: demuestra que con un presupuesto minimo de computo (una GPU consumer o una T4 en cloud) se puede pasar de un BLEU de 0,06 en el modelo base a 13,85 en el adaptador afinado, manteniendo licencia Apache 2.0 y un formato de despliegue compatible con el ecosistema PEFT/Transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 1B Instruct) con adaptador LoRA |
| Parametros totales | ~1.000 millones (modelo base) + 13,05 millones entrenables en el adaptador |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (entrenamiento con max sequence length de 256 tokens) |
| Tipos de cuantizacion | 4 bits NF4 (obligatoria para inferencia segun el autor); bf16 en entrenamiento |
| Idiomas soportados | en (ingles), lg (luganda) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base google/gemma-3-1b-it |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de Gemma 3 1B Instruct. El entrenamiento uso QLoRA: cuantizacion 4 bits NF4 con doble cuantizacion y tipo de computo bf16, mas adaptadores LoRA de rango 16, alpha 32 y dropout 0,05 sobre los modulos q_proj, k_proj, v_proj, o_proj, gate_proj, up_proj y down_proj. Se entreno durante 1 epoca con batch efectivo de 16 (8 x 2 de acumulacion de gradientes), learning rate 2e-4 con schedule coseno, optimizador paged AdamW 8-bit y longitud maxima de secuencia de 256 tokens. El coste total fue de aproximadamente 8 horas en una Tesla T4, con perdida final de entrenamiento de 1,55 y de validacion de 1,26.

Los datos provienen del corpus Sunbird SALT (corpus paralelo multilingue traducido profesionalmente, con tematica de agricultura, salud, sociedad y otros dominios localmente relevantes). A partir de unas 24.000 frases paralelas limpias se generaron 94.542 ejemplos de entrenamiento en tres tareas: traduccion ingles-luganda, traduccion luganda-ingles y conversacion en luganda, con particion 90/5/5. No se menciona RLHF ni DPO; el ajuste es SFT supervisado. La innovacion destacable no es arquitectonica sino de eficiencia: un adaptador de 52 MB que se puede servir junto al modelo base cuantizado en 4 bits en hardware muy modesto.

## Capacidades

- Traduccion automatica bidireccional ingles-luganda, con BLEU 13,85 y chrF++ 46,59 en el conjunto de prueba SALT.
- Conversacion en luganda: responde a instrucciones del tipo "Respond in Luganda", "Answer in Luganda" o "Yogera mu Luganda".
- Robustez a multiples plantillas de prompt: acepta variantes como "Translate to Luganda", "Convert this to Luganda", "English to Luganda" o "How do you say this in Luganda?" y sus equivalentes inversos.
- Generacion de texto general heredada del modelo base Gemma 3 1B Instruct (razonamiento basico, respuesta a preguntas, codigo elemental), aunque el ajuste esta centrado en traduccion y conversacion en luganda.
- Capacidad multilingue limitada a ingles y luganda; no hay evidencia de soporte fiable para otras lenguas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso orientado a agentes en la informacion disponible.
- No se documenta vision, audio ni modo thinking explicito.

## Casos de uso

- Traduccion de documentacion sanitaria y agricola al luganda: el corpus SALT cubre precisamente salud y agricultura, por lo que el modelo es adecuado para traducir materiales divulgativos, folletos y guias de campo del ingles al luganda con terminologia alineada con el dominio de entrenamiento.
- Localizacion de interfaces y contenido web: integrable en un pipeline de traduccion por lotes que reciba cadenas en ingles y devuelva luganda, con decodificacion determinista (`do_sample=False`) para mantener consistencia entre versiones de la interfaz.
- Atencion al ciudadano en luganda: el modelo puede mantener conversaciones multi-turno sencillas en luganda dentro de la ventana de contexto del modelo base, util para prototipos de asistentes de servicios publicos en Uganda.
- Traduccion inversa luganda-ingles para analisis de feedback: permite procesar opiniones o mensajes de usuarios escritos en luganda y convertirlos a ingles para su clasificacion o analisis posterior con herramientas existentes.
- Investigacion en PLN de bajos recursos: sirve como linea base reproducible y ligera (adaptador de 52 MB, entrenamiento en T4) para experimentos de traduccion en lenguas bantu, comparando con otros corpus como JW300 o Kimera.
- Despliegue en hardware limitado: al requerir solo el modelo base de 1B en 4 bits mas un adaptador de 52 MB, es viable en una unica GPU consumer o incluso en entornos con una T4, lo que facilita pilotos de traduccion en organizaciones con presupuesto reducido.
- Generacion de pares de entrenamiento aumentados: el modelo puede producir traducciones candidatas al luganda que, tras revision humana, amplien corpus paralelos para futuros ajustes.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index y en la model card (no verificados de forma independiente):

| Modelo | BLEU | chrF++ |
|---|---|---|
| Gemma 3 1B base (sin ajuste) | 0,06 | 8,84 |
| Luganda-gemma-1b-it | 13,85 | 46,59 |

Evaluacion sobre 100 ejemplos reservados del split de test de SALT, mezclando prompts ingles-luganda y luganda-ingles. El autor advierte explicitamente que no es una evaluacion FLORES y que las puntuaciones no son directamente comparables con sus modelos de suajili evaluados en FLORES.

## Requisitos de hardware

- VRAM estimada: el modelo base de 1B en 4 bits NF4 ocupa del orden de 1 GB de pesos; con overhead de activaciones y contexto, cabe holgadamente en GPUs con 4-6 GB de VRAM. El adaptador anade solo 52 MB.
- Cuantizacion obligatoria: el autor indica que la inferencia debe hacerse en 4 bits, porque los pesos LoRA se entrenaron contra pesos base cuantizados en 4 bits; cargar en 8 bits o precision completa degrada las traducciones.
- GPU recomendadas: Tesla T4 (la usada en entrenamiento), RTX 3060/4060 y superiores; cualquier GPU consumer con al menos 4-6 GB de VRAM es suficiente.
- Despliegue: via Transformers + PEFT + bitsandbytes (ruta documentada por el autor). No se documentan recetas para vLLM, llama.cpp, Ollama o TGI en la informacion disponible; al ser un adaptador PEFT sobre un modelo base con cuantizacion bitsandbytes, el camino soportado es el stack Transformers/PEFT.
- Latencia y throughput: no disponibles en la informacion proporcionada. El entrenamiento completo tardo unas 8 horas en una T4 para 1 epoca.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Luganda-gemma-1b-it | ~1B + 13,05M adaptador | no disponible | Traduccion en-luganda y conversacion | Apache 2.0 | Hugging Face (adaptador PEFT) |
| google/gemma-3-1b-it (base) | ~1B | no disponible | Modelo general instruct | Gemma Terms of Use | Hugging Face |
| Modelos de traduccion en-luganda de AmplifiedAccess evaluados en FLORES (suajili) | no disponible | no disponible | Traduccion de lenguas africanas | no disponible | no disponible |

No se dispone en la informacion proporcionada de resultados de otros sistemas de traduccion ingles-luganda comparables en el mismo conjunto SALT, por lo que la comparativa cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Entrenado principalmente sobre el corpus Sunbird SALT; el rendimiento fuera de los dominios cubiertos (agricultura, salud, sociedad) puede degradarse notablemente.
- Solo 1 epoca de entrenamiento; el propio autor senala que 3 o mas epocas y fuentes adicionales (JW300, corpus Kimera) probablemente mejorarian los resultados.
- Longitud maxima de secuencia en entrenamiento de 256 tokens: las traducciones o conversaciones largas pueden truncarse o perder calidad.
- Requiere cuantizacion 4 bits NF4 en inferencia; usar 8 bits o precision completa produce traducciones degradadas, lo que limita su integracion en stacks que no soporten bitsandbytes.
- Riesgo de alucinacion y de traducciones plausibles pero incorrectas, especialmente en terminologia especializada no vista en entrenamiento; se recomienda revision humana en contextos criticos (sanidad, legal).
- Sesgos potenciales heredados del modelo base Gemma 3 1B y del corpus SALT, cuya composicion demografica y tematica no se detalla en la informacion disponible.
- Soporte limitado a ingles y luganda; no debe asumirse calidad en otras lenguas, incluidas otras lenguas bantu cercanas.
- Evaluacion con solo 100 ejemplos y metricas no verificadas de forma independiente; los valores de BLEU y chrF++ deben tomarse como orientativos.
- Licencia Apache 2.0 para el adaptador, pero el uso del modelo base esta sujeto adicionalmente a los terminos de Gemma; conviene revisar ambas condiciones antes de un despliegue comercial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AmplifiedAccess/Luganda-gemma-1b-it
- Modelo base: https://huggingface.co/google/gemma-3-1b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/Sunbird/salt
