# AIHeikki/lisa-gemma4-e4b-visual-auditor

## Resumen

Lisa (`lisa-gemma4-e4b-visual-auditor`, experimento `Exp 5B`) es un modelo vision-language derivado de `google/gemma-4-E4B-it` mediante un ajuste fino con LoRA en BF16 sobre las capas del codificador visual y del decodificador de lenguaje. Lo desarrolla AIHeikki y su proposito es actuar como auditor forense de presentaciones y diagramas tecnicos: detectar graficos enganosos, contradicciones numericas entre diapositivas, incumplimientos de paleta de marca y problemas de tipografia o densidad informativa. Frente a un VLM generico, que tiende a resumir y elogiar el contenido, Lisa emite veredictos con defecto identificado, severidad y localizacion espacial.

El modelo se distribuye como adaptador PEFT LoRA (186,2 MB) y como artefactos GGUF listos para `llama.cpp` y Ollama: un cuantizado `Q4_K_M` de 4,97 GiB y un proyector visual `mmproj` en BF16 de 945,6 MiB, necesario para entrada de imagen. El repositorio ocupa 6,5 GB y los pesos en safetensors suman 7.518.069.290 parametros, correspondientes al modelo base completo mas el adaptador.

Su relevancia es practica: cubre un nicho concreto de control de calidad documental donde los VLM de proposito general rinden mal segun la propia evaluacion del autor (32,0 % de aprobacion estricta en el modelo base frente al 92,0 % de Lisa sobre 50 decks no vistos). La licencia Apache 2.0 facilita su integracion en pipelines corporativos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (modelo base `google/gemma-4-E4B-it`) con adaptador LoRA en capas de vision y de lenguaje |
| Parametros totales | 7.518.069.290 (safetensors); adaptador LoRA de 186,2 MB |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el ejemplo de despliegue usa `-c 8192`) |
| Tipos de cuantizacion | Q4_K_M (GGUF, 4,97 GiB); BF16 para el adaptador LoRA y el proyector `mmproj` (945,6 MiB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT), GGUF (modelo cuantizado y proyector visual), Modelfile de Ollama |

## Arquitectura y entrenamiento

Lisa parte de `google/gemma-4-E4B-it`, un modelo multimodal con codificador visual y decodificador de lenguaje, y aplica un LoRA conjunto con `r = 16` y `alpha = 16` en BF16 sobre ambos bloques, de modo que el ajuste no se limita al alineamiento vision-lenguaje sino que tambien modifica las capas del decodificador. El adaptador resultante se fusiona y se exporta a GGUF en cuantizacion `Q4_K_M`, acompanado de un proyector visual BF16 independiente para su uso en `llama.cpp`.

El entrenamiento se realizo sobre decks renderizados programaticamente a alta resolucion (1600x900), en pares de diapositiva unica y multi-diapositiva generados con `render_deck_dataset.py`, con cajas delimitadoras en pixeles como verdad de referencia y distorsiones geometricas inyectadas deliberadamente. Las cinco dimensiones forenses cubiertas son: deteccion de graficos enganosos y ejes truncados, contradicciones numericas entre diapositivas, cumplimiento de paleta y contraste de marca, tipografia y densidad informativa, y calibracion para no generar falsos positivos en diapositivas correctas. No se especifican en la informacion disponible el volumen de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de texto e imagen-a-texto conversacional sobre contenido visual de diapositivas y diagramas tecnicos.
- Deteccion de graficos enganosos: desajustes entre altura de barra y etiqueta de dato, ejes truncados con base distinta de cero y manipulacion de escalas de doble eje.
- Forense de contradicciones entre diapositivas: comparacion de pares (por ejemplo, resumen ejecutivo frente a tabla financiera en anexo) para senalar cifras de ARR, margen, plantilla o calendario incompatibles.
- Auditoria de marca: identificacion de colores fuera de paleta, fallos de contraste texto-fondo y modificaciones no autorizadas de plantilla.
- Auditoria tipografica y de densidad: deteccion de sobrecarga de contenido, tamanos de nota al pie demasiado pequenos y jerarquia visual rota.
- Localizacion espacial: devuelve coordenadas y cuadrantes de los defectos detectados (recall de grounding espacial del 93,5 % en la evaluacion del autor).
- Calibracion de diapositivas limpias: capacidad de aprobar decks correctos sin inventar criticas.
- Entrada de imagen en `llama.cpp` mediante el proyector `mmproj` BF16.
- Soporte de tool calling y de agentes multi-paso: no disponible en la informacion proporcionada.

## Casos de uso

- Control de calidad previo a presentaciones ejecutivas: se envia cada diapositiva al modelo y este devuelve veredicto, defecto, severidad y ubicacion, permitiendo bloquear el envio de un deck con graficos truncados o cifras incoherentes antes de una reunion de consejo.
- Verificacion de consistencia financiera entre secciones: el modelo compara el resumen ejecutivo con los anexos y marca discrepancias de ARR, margen o previsiones, algo adecuado porque fue entrenado especificamente con pares multi-diapositiva.
- Cumplimiento de identidad corporativa: integrado en el pipeline de generacion de plantillas, valida que cada color de acento y cada combinacion texto-fondo respete la paleta oficial y los ratios de contraste, con una tasa de acierto reportada del 100 % en la categoria de paleta y contraste.
- Revision automatica de informes de sostenibilidad o memorias anuales: audita graficos de emisiones o evolucion de KPIs para detectar ejes manipulados que exageren tendencias, usando la deteccion de distorsion de ejes entrenada de forma explicita.
- Auditoria de material formativo y documentacion tecnica: detecta diagramas de arquitectura con jerarquia visual rota o texto ilegible, util en equipos que producen cientos de diapositivas por trimestre.
- Pre-publicacion en herramientas de presentaciones asistidas por IA: actua como capa de validacion que rechaza o corrige la salida de un generador de slides antes de mostrarla al usuario final.
- Revision de due diligence en fusiones y adquisiciones: contrasta el deck del vendedor con sus anexos para localizar contradicciones numericas, aprovechando la ventana de contexto configurable (8.192 tokens en el ejemplo de despliegue) para procesar varias diapositivas por llamada.

## Benchmarks y rendimiento

Evaluacion del autor sobre `N = 50` decks renderizados no vistos, repartidos en cinco categorias de 10:

| Metrica | Base `gemma-4-E4B-it` | Lisa (`Exp 5B`) | Ganancia absoluta |
|---|---|---|---|
| Tasa de aprobacion estricta global (veredicto + defecto + severidad + grounding) | 32,0 % | 92,0 % | +60,0 pp |
| Deteccion de graficos enganosos y distorsion de ejes (N=10) | 20,0 % | 90,0 % | +70,0 pp |
| Contradiccion numerica entre diapositivas (N=10) | 30,0 % | 90,0 % | +60,0 pp |
| Cumplimiento de paleta y contraste de marca (N=10) | 10,0 % | 100,0 % | +90,0 pp |
| Auditoria de tipografia y densidad (N=10) | 20,0 % | 80,0 % | +60,0 pp |
| Calibracion en diapositivas limpias (N=10) | 80,0 % | 100,0 % | +20,0 pp |
| Recall de grounding espacial (cuadrante y coordenadas) | 28,5 % | 93,5 % | +65,0 pp |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6 GB con el GGUF `Q4_K_M` (4,97 GiB) mas el proyector `mmproj` BF16 (945,6 MiB) y el contexto; en BF16 el modelo base de 7,5B parametros requiere del orden de 15-16 GB.
- GPU recomendadas: RTX 4090, RTX 3090, A100 o H100 para BF16; cualquier GPU con 8 GB o mas para el GGUF cuantizado.
- Cabe en GPU de consumo: si, con la cuantizacion `Q4_K_M` en tarjetas de 8 GB en adelante (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 y superiores).
- Opciones de despliegue: `llama.cpp` mediante `llama-server` con `--mmproj` (script `run_lisa_server.sh` incluido), Ollama mediante el `Modelfile` del repositorio, y PEFT con el adaptador LoRA sobre el modelo base para stacks de Transformers. Compatible con endpoints de Hugging Face segun los tags.
- Latencia y throughput: no disponibles en la informacion proporcionada. El autor recomienda `--temp 0.1` y `-ngl 99` para el despliegue de referencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Lisa (`lisa-gemma4-e4b-visual-auditor`) | 7,5B | no disponible (ejemplo con 8192) | Auditoria forense de slides y marca | Apache 2.0 | Hugging Face (adaptador PEFT + GGUF) |
| `google/gemma-4-E4B-it` (base) | 7,5B (aproximado) | no disponible | VLM conversacional de proposito general | Gemma (segun modelo base) | Hugging Face |
| `AIHeikki/mona-qwen3.5-4b-epistemic-sparring` | 4B | no disponible | Disciplina epistemica textual y RAG | no disponible | Hugging Face |
| `AIHeikki/fable-mistral-small-4-119b-telco-lora` | 119B MoE | no disponible | Arquitecto 5G SA y diagnostico NOC | no disponible | Hugging Face |

La comparacion con otros auditores visuales especializados no esta disponible en la informacion proporcionada; los dos modelos de la trilogia se incluyen por contexto del autor, no como alternativas funcionales.

## Limitaciones y advertencias

- El benchmark de 50 decks es una evaluacion propia del autor, sin validacion externa ni comparacion con otros auditores; los porcentajes deben tomarse como indicativos.
- El entrenamiento se basa en decks renderizados programaticamente a 1600x900; el rendimiento puede degradarse con capturas de pantalla reales, fotos de proyector, PDFs con artefactos de compresion o relaciones de aspecto distintas.
- La deteccion de contradicciones numericas depende de que las cifras sean legibles en la imagen; texto pequeno o graficos muy densos pueden provocar errores de lectura y, por tanto, falsos positivos o negativos.
- La calibracion en diapositivas limpias alcanza el 100 % en el conjunto de evaluacion, pero con solo 10 muestras; en produccion es esperable cierto porcentaje de criticas infundadas.
- Riesgo de alucinacion en la descripcion de defectos y en la localizacion espacial: el recall de grounding es del 93,5 %, no del 100 %.
- No hay informacion sobre sesgos demograficos, culturales o linguisticos, ni sobre el soporte real de idiomas distintos del usado en el entrenamiento.
- La licencia Apache 2.0 se declara coincidente con la del modelo base; conviene verificar los terminos de `google/gemma-4-E4B-it` para uso comercial, ya que las licencias de los modelos Gemma han incluido historicamente condiciones adicionales de uso aceptable.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en produccion por terceros.
- El adaptador LoRA requiere cargar el modelo base completo ademas de los 186,2 MB del adaptador si se usa la ruta PEFT.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AIHeikki/lisa-gemma4-e4b-visual-auditor
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Modelo hermano `Exp 5A` (Mona): https://huggingface.co/AIHeikki/mona-qwen3.5-4b-epistemic-sparring
- Modelo hermano `Exp 5C` (Fable): https://huggingface.co/AIHeikki/fable-mistral-small-4-119b-telco-lora
- Informe de evaluacion: `reports/EVALUATION_REPORT_EXP5B.md` (incluido en el repositorio)
- Narrativa de los experimentos: `reports/MONA_AND_LISA_EXPERIMENT_STORY.md` (incluido en el repositorio)
- Ejemplo de auditoria real: `reports/LISA_SOVEREIGN_AI_SDLC_AUDIT.md` (incluido en el repositorio)
- Paper, blog o demo adicionales: no disponibles en la informacion proporcionada
