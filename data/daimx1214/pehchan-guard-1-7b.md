# Daimx1214/pehchan-guard-1.7b

## Resumen

Pehchan Guard es un modelo de redaccion de datos personales (PII) especializado en texto paquistani, desarrollado por Daimx1214 (Daim Ali) para el Qwen Local Hackathon 2026. Se trata de un fine-tune LoRA (QLoRA) sobre Qwen3-1.7B, distribuido tanto en safetensors como en GGUF Q4_K_M, y disenado para ejecutarse integramente en local, sin ninguna llamada de red. El modelo recibe texto en urdu, roman urdu o ingles y devuelve el mismo texto con siete tipos de datos personales sustituidos por etiquetas, acompanado de una lista de los elementos detectados.

El problema que resuelve es concreto: las herramientas de redaccion en la nube ven primero los datos privados que deberian proteger, y las soluciones basadas en expresiones regulares fallan en los elementos mas sensibles del urdu y el roman urdu (nombres y direcciones). Segun la model card, un script de regex alcanza F1 0.615 en el conjunto de test con cero nombres y cero direcciones detectadas, mientras que Qwen3-1.7B zero-shot baja a F1 0.008. El fine-tune alcanza F1 0.970 con 89,2 % de coincidencia exacta.

Con 1.720.574.976 parametros, contexto de 2048 tokens y un peso GGUF de 1,03 GiB, esta pensado para portatiles convencionales y entornos sin GPU. La relevancia actual esta en el nicho: redaccion de PII offline para un mercado linguistico (urdu / roman urdu) practicamente desatendido por los modelos generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador LoRA fusionado |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | GGUF Q4_K_M (1,03 GiB); safetensors en precision completa |
| Idiomas soportados | ur (urdu), en (ingles); incluye roman urdu |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only, y se entrena mediante QLoRA con Unsloth y TRL: r=16, alpha=32, aplicado a todas las capas lineales, con la funcion de perdida calculada solo sobre las respuestas, modo thinking desactivado, longitud maxima de 1536 tokens, batch 8 con acumulacion de gradiente 2, 3 epocas y learning rate 2e-4. El entrenamiento completo se ejecuto en una Google Colab T4 gratuita en 29,5 minutos, con un pico de memoria GPU de 5,9 GB. Un unico system prompt y un unico formato de salida se usan de forma consistente en entrenamiento, evaluacion, Modelfile y demos.

Los datos son 100 % sinteticos: un generador construye ejemplos a partir de listas de nombres, areas y ciudades, junto con plantillas de frases y valores aleatorios con formato correcto (estructura real de CNIC, patrones de movil y fijo paquistanies, IBAN con digitos de control validos). El reparto es de 3200 ejemplos de entrenamiento, 400 de validacion y 400 de test reservado; cada quinto nombre, area y ciudad y cada cuarta plantilla son exclusivos de test y no aparecen en entrenamiento (verificado: cero solapamiento de entrada entre train y test). La mezcla linguistica es aproximadamente 40 % ingles, 35 % roman urdu y 25 % urdu en escritura arabe, y cerca de 1 de cada 10 ejemplos es texto limpio, para que el modelo aprenda a no modificar texto sin PII.

## Capacidades

- Redaccion de siete tipos de PII: nombres, numeros de CNIC, telefonos, correos electronicos, direcciones postales, numeros de cuenta bancaria / IBAN y matriculas de vehiculo.
- Devolucion del texto redactado con etiquetas mas una lista estructurada (FOUND) de los elementos detectados y su categoria.
- Procesamiento multilingue dentro del mismo prompt: urdu en escritura arabe, roman urdu e ingles, con mezcla de idiomas en un mismo texto.
- Preservacion de texto limpio: no altera fragmentos sin datos personales (0 % de falsos cambios en el conjunto de test).
- Inferencia 100 % offline, sin llamadas de red en ninguna parte del pipeline.
- Ejecucion en CPU mediante Ollama / llama.cpp con el GGUF Q4_K_M.
- No cubre tool calling, function calling, agentes, vision, audio ni modo thinking (este ultimo se desactiva explicitamente en entrenamiento).

## Casos de uso

- Redaccion previa a compartir texto en soportes de atencion al ciudadano: un operador pega una consulta con nombre, CNIC y telefono, y obtiene el texto anonimizado listo para reenviar a terceros o archivar, sin que los datos salgan del equipo.
- Cumplimiento de privacidad en pequenas organizaciones sin infraestructura cloud: el modelo corre en un portatil y permite anonimizar registros antes de subirlos a sistemas compartidos, evitando exponer PII a servicios externos.
- Preprocesado de datasets para entrenamiento: limpieza de corpus en urdu y roman urdu antes de usarlos en pipelines de ML, con la lista FOUND como registro de auditoria de lo eliminado.
- Triaje de tickets de soporte: deteccion y eliminacion de datos personales en hilos de correo o mensajeria antes de que lleguen a herramientas de ticketing o a modelos externos.
- Anonimizacion de registros de conversaciones: procesamiento batch de transcripciones en urdu/roman urdu para construir datasets publicables sin exponer nombres, telefonos o IBAN.
- Filtro de entrada en formularios y chats locales: integracion como paso previo a un registro o base de datos para marcar contenido con PII y decidir si se almacena o se redacta.
- Verificacion de textos antes de publicacion: revision de documentos en ingles paquistani y roman urdu para comprobar que no queda ninguna matricula, cuenta o CNIC visible.

## Benchmarks y rendimiento

Conjunto de test reservado (n=400, 1267 elementos personales), con scorer automatico estricto (un elemento cuenta solo si aparece en FOUND con la etiqueta correcta y ya no esta presente en el texto redactado):

| Modelo | F1 global | Coincidencia exacta | Elementos filtrados (leaks) | Texto limpio alterado |
|---|---|---|---|---|
| Solo regex | 0.615 | 8,7 % | 686 | 0 % |
| Qwen3-1.7B base (zero-shot) | 0.008 | 1,3 % | 486 | 84 % |
| Pehchan Guard | 0.970 | 89,2 % | 5 | 0 % |

F1 por tipo (Pehchan Guard): CNIC 0.996, PHONE 0.991, EMAIL 0.995, ADDRESS 1.000, VEHICLE 1.000, BANK 0.984, NAME 0.940.

Conjunto dificil escrito a mano (60 ejemplos con erratas, espaciado irregular como `35202 1234567 1`, titulos como Dr. y Chaudhry, nombres que son palabras comunes): F1 0.883, cero elementos filtrados (modelo base: 0.000); los nombres son el tipo mas debil (F1 0.831). La lista completa de fallos esta publicada en el repositorio del proyecto (`results/failures.md`).

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el GGUF Q4_K_M ocupa 1,03 GiB en disco y aproximadamente 1,44 GiB de RAM mientras esta cargado.
- GPU recomendadas: ninguna imprescindible. El entrenamiento se hizo en una T4 (pico de 5,9 GB); la inferencia esta validada en CPU.
- Cabe en cualquier GPU consumer (RTX 4090, RTX 3060, etc.) y en portatiles convencionales; tambien en CPU-only.
- Despliegue: Ollama (llama.cpp) con el Modelfile del repositorio del proyecto; el GGUF es compatible con llama.cpp. No hay datos publicados sobre vLLM o TGI para este fine-tune.
- Latencia y throughput medidos: 6,5 tokens/segundo de mediana sobre 5 prompts en una VM cloud AMD EPYC con aproximadamente 1,5 vCPU limitados, CPU-only, 7 GB de RAM y Ollama 0.40.17. El autor indica que la VM es deliberadamente mas debil que un portatil moderno, que rendira notablemente mas rapido. El GGUF local iguala al modelo de Colab en una comprobacion cruzada de 20 ejemplos (F1 0.970 en ambos).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pehchan Guard | 1,72 B | 2048 | Redaccion de PII urdu/roman urdu/ingles | Apache-2.0 | safetensors + GGUF (Ollama) |
| Qwen3-1.7B base | 1,72 B | no disponible en la informacion | Modelo generalista | Apache-2.0 | Hugging Face |
| Script de regex (referencia del autor) | n/a | n/a | Reglas para PII paquistani | n/a | Codigo del proyecto |

No se dispone en la informacion proporcionada de datos sobre otros redactores de PII comparables; la comparacion se limita a las tres referencias evaluadas por el autor.

## Limitaciones y advertencias

- Los datos de entrenamiento son sinteticos y mas limpios que el texto real; la puntuacion en el conjunto dificil (F1 0.883) es la estimacion mas honesta para entradas desordenadas.
- Errores residuales principales: nombres acompanados de titulos, nombres que coinciden con palabras comunes y espaciado roto en identificadores.
- Solo redacta los siete tipos listados; nombres de empresas, numeros de pedido, importes y fechas se dejan intactos de forma deliberada.
- En el conjunto de test estandar, 5 de 1267 elementos siguieron filtrandose; el autor recomienda revisar siempre la salida antes de compartir texto redactado.
- Cobertura linguistica limitada a urdu, roman urdu e ingles; no hay datos sobre otros idiomas.
- Contexto de 2048 tokens: textos largos deben dividirse en fragmentos, con riesgo de perder entidades a caballo entre fragmentos.
- Licencia Apache-2.0 permite uso comercial, pero no se documentan garantias ni auditorias de cumplimiento normativo; para produccion conviene tratar la salida como sugerencia revisable, no como redaccion definitiva.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Daimx1214/pehchan-guard-1.7b
- Repositorio del proyecto (codigo, generador de datos, scorer y demos): https://github.com/Daimx1214/pehchan-guard
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Lista de fallos publicada: `results/failures.md` en el repositorio del proyecto
