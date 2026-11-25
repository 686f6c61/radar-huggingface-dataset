# rishitkar/SetuNLP-indictrans2-1B-doi-pun-LoRA

## Resumen

SetuNLP-indictrans2-1B-doi-pun-LoRA es una colección de dos adaptadores LoRA independientes que especializan el modelo de traducción automática `ai4bharat/indictrans2-indic-indic-1B` para la traducción bidireccional entre dogri (doi, en escritura devanagari) y panyabí (pa, en escritura gurmuji). Lo publica el usuario rishitkar en Hugging Face bajo licencia MIT, con pesos en formato PEFT/safetensors y un tamaño de repositorio de 0,4 GB, lo que refleja que solo se distribuyen los adaptadores y no el modelo base completo.

El modelo resuelve un problema concreto de la traducción automática de bajos recursos: la escasez de sistemas de calidad para el par dogri-panyabí, dos lenguas indoarias con millones de hablantes pero con poca cobertura en los sistemas comerciales. La propuesta es pragmática: en lugar de entrenar un transformer desde cero, se congela el modelo base IndicTrans2-1B y se inyectan adaptadores LoRA de rango 96 sobre las proyecciones de atención y las capas feed-forward, lo que permite obtener BLEU de 52,93 en doi→pan y 46,38 en pan→doi sobre un conjunto de test reservado.

La relevancia actual reside en que demuestra que el ajuste fino parametrizado eficiente (PEFT) puede llevar un modelo multilingüe genérico a un rendimiento competitivo en un par lingüístico muy específico con solo 23.151 pares paralelos limpios y un 8,08 % de parámetros entrenables. El modelo está pensado para investigadores y desarrolladores que necesiten integrar traducción dogri-panyabí en pipelines propios sin depender de servicios propietarios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (IndicTrans2) con adaptadores LoRA |
| Parámetros totales | 1,31B (modelo base congelado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con max_length=256 en tokenizador) |
| Tipos de cuantización | no disponible (pesos del adaptador en safetensors; el base en fp16) |
| Idiomas soportados | dogri (doi, devanagari) y panyabí (pa, gurmuji) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA); el base se descarga por separado |

## Arquitectura y entrenamiento

El modelo base IndicTrans2-1B es un transformer encoder-decoder diseñado específicamente para lenguas índicas, con código de modelado personalizado que requiere `trust_remote_code=True`. Sobre él se aplican dos adaptadores LoRA independientes, uno por dirección, entrenados desde cero y sin compartir nada entre sí. Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `out_proj`, `fc1` y `fc2`, cubriendo la autoatención del encoder, la autoatención del decoder, la atención cruzada del decoder y ambas capas feed-forward. La configuración LoRA usa rango 96, alpha 128 y dropout 0,1, lo que resulta en 106.168.320 parámetros entrenables, un 8,08 % del total de 1,31B.

El entrenamiento consistió en ajuste fino supervisado simple sobre un corpus paralelo alineado de 28.000 pares proporcionado para la tarea SetuNLP. Tras un pipeline de limpieza que incluyó normalización NFC (no NFKC, para preservar letras con nukta), comprobaciones de escritura (gurmuji en panyabí, devanagari en dogri), filtros de longitud (2-120 palabras por lado, ratio máximo 3,0), filtrado semántico con LaBSE (similitud coseno mínima de max(0,55, percentil 5), que eliminó 4.798 pares probablemente mal alineados) y deduplicación, quedaron 23.151 pares. Los splits fueron 90/5/5 con semilla fija: 20.835 de entrenamiento, 1.158 de validación (con subconjunto fijo de 1.000 para selección de época) y 1.158 de test, usado una sola vez tras el entrenamiento. No se emplearon back-translation, datos pivote, datos monolingües, promediado de adaptadores ni decodificación MBR. El optimizador fue AdamW con β = 0,9/0,999.

## Capacidades

- Traducción automática bidireccional dogri→panyabí y panyabí→dogri, con un adaptador dedicado por dirección.
- Manejo correcto de escrituras: IndicTrans2 opera internamente en devanagari, y el `IndicProcessor` convierte gurmuji a devanagari en la entrada y de vuelta a la escritura destino en la salida.
- Decodificación por haces (beam search) con `num_beams=5` en los ejemplos de la model card, con `early_stopping` y caché de atención.
- Carga simultánea de ambos adaptadores sobre una sola instancia del modelo base, alternando con `set_adapter`.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un modelo puramente de traducción seq2seq.
- Capacidad multilingüe limitada a los dos idiomas del par; no se documenta comportamiento en otros pares.

## Casos de uso

- Traducción de documentación administrativa entre dogri y panyabí: el modelo traduce textos oficiales en ambos sentidos con BLEU superior a 46, adecuado para borradores que un revisor humano pule después.
- Localización de contenido web y aplicaciones: integración en un pipeline de CI/CD que traduzca cadenas de recursos entre ambas lenguas, aprovechando que los adaptadores son ligeros (0,4 GB) y se cargan sobre un único modelo base.
- Subtitulado y doblaje de material audiovisual: traducción de guiones y subtítulos entre las dos lenguas con `num_beams=5` para mejorar la fluidez en frases cortas.
- Preservación lingüística y digitalización de patrimonio: traducción de corpus históricos o literarios en dogri a panyabí (y viceversa) para facilitar el acceso cruzado entre comunidades lingüísticas.
- Atención al ciudadano en regiones bilingües: sistemas de traducción en tiempo real para servicios públicos en zonas donde conviven hablantes de dogri y panyabí, con el modelo desplegado en una GPU consumer.
- Investigación en traducción de bajos recursos: base reproducible para experimentos de PEFT, comparación de estrategias de filtrado (LaBSE, reglas) y evaluación de BLEU/chrF++ en pares índicos poco cubiertos.
- Generación de datos sintéticos paralelos: usar el modelo para producir pares dogri-panyabí que alimenten otros sistemas o amplíen corpus de entrenamiento, con revisión humana posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el conjunto de test reservado:

| Dirección | BLEU | chrF++ |
|---|---|---|
| Dogri → Panyabí (doi2pan) | 52,93 | 65,15 |
| Panyabí → Dogri (pan2doi) | 46,38 | 58,75 |

No se han publicado en la información disponible resultados comparativos con otros modelos en estos mismos conjuntos, ni métricas adicionales (COMET, TER, METEOR).

## Requisitos de hardware

- VRAM estimada: el modelo base de 1,31B en fp16 ocupa aproximadamente 2,6 GB de pesos; con activaciones y caché de atención para batches pequeños, el consumo se sitúa en torno a 4-6 GB. Los adaptadores LoRA añaden unos 0,4 GB en disco y una fracción mínima en memoria.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; una RTX 4090, A100 o H100 ofrece margen para batches mayores y mayor throughput.
- Cabe en GPU consumer: sí, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, así como en GPUs de 8 GB con batches reducidos.
- Opciones de despliegue: al ser un modelo PEFT con código personalizado, la vía documentada es `transformers` (<4.40) + `peft` (<=0.10.0) + `accelerate` (>=0.28,<0.30) + `IndicTransToolkit`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SetuNLP-indictrans2-1B-doi-pun-LoRA | 1,31B (base) + 106M entrenables | no disponible | doi, pa | MIT | Hugging Face (adaptadores) |
| ai4bharat/indictrans2-indic-indic-1B (base) | 1,31B | no disponible | Lenguas índicas (multilingüe) | no disponible en la información | Hugging Face |
| Otros adaptadores LoRA de la familia SetuNLP | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de los modelos comparables sobre el mismo conjunto de test, por lo que no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- Resultados de benchmarks declarados por el autor y marcados como no verificados; conviene reproducirlos antes de usarlos en producción.
- Entrenado solo con 23.151 pares tras filtrado; el dominio y el registro del corpus condicionan fuertemente la calidad en otros contextos.
- Requiere obligatoriamente el `IndicProcessor` para el preprocesado y postprocesado; omitirlo produce salidas en escritura incorrecta o de baja calidad.
- Dependencia de versiones antiguas de `transformers` (<4.40) y `peft` (<=0.10.0) por el código personalizado de IndicTrans2; versiones más recientes pueden no funcionar.
- Riesgo de alucinación y de traducciones literales en frases largas o con terminología especializada; no se documentan evaluaciones en dominios técnicos, legales o médicos.
- Sesgos potenciales heredados del corpus SetuNLP y del modelo base; no se documenta ningún análisis de sesgo.
- Licencia MIT para los adaptadores, pero el modelo base se distribuye por separado y su licencia debe verificarse antes de uso comercial.
- No soporta tool calling, agentes ni multimodalidad; su uso está restringido a traducción de texto.
- Contexto máximo de entrenamiento limitado a 256 tokens en el tokenizador de ejemplo; frases más largas pueden degradar la calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rishitkar/SetuNLP-indictrans2-1B-doi-pun-LoRA
- Modelo base: https://huggingface.co/ai4bharat/indictrans2-indic-indic-1B
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- IndicTransToolkit: https://github.com/VarunGumma/IndicTransToolkit
