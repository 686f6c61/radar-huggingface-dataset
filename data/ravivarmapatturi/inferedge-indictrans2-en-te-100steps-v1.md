# ravivarmapatturi/inferedge-indictrans2-en-te-100steps-v1

## Resumen

InferEdge IndicTrans2 English-Telugu 100 steps es un checkpoint de investigación ajustado (fine-tuned) a partir de `ai4bharat/indictrans2-en-indic-dist-200M`, el modelo destilado de 200 millones de parámetros de AI4Bharat para traducción del inglés a lenguas índicas. El ajuste lo ha realizado InferEdge AI / VaayuEdge (bajo la cuenta de Hugging Face de ravivarmapatturi) y se centra exclusivamente en el par inglés→telugu. El propio autor advierte que no es una nueva arquitectura, ni un modelo entrenado desde cero, ni un sistema aprobado para producción.

El modelo responde a un problema concreto: mejorar la calidad de traducción al telugu en el dominio de noticias diarias (corpus BPCC-H-Daily) partiendo del modelo base de AI4Bharat. Tras solo 100 pasos de optimización con AdamW (aproximadamente 200 ejemplos procesados, menos de una época sobre 7.673 filas de entrenamiento), el checkpoint mejora ligeramente las métricas chrF++ y BLEU respecto al modelo base en los conjuntos internos de validación y test, con mejoras estadísticamente significativas en el dominio BPCC y en el subconjunto conversacional de IN22, pero no en el dominio general de IN22.

Su relevancia actual es más metodológica que práctica: es un ejemplo bien documentado de adaptación ligera y reproducible de un modelo de traducción índico, con manifiestos de hashes, informes de benchmark y protocolos de evaluación incluidos en el repositorio. Arquitectónicamente hereda el transformador seq2seq de IndicTrans2 y conserva la licencia MIT del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer seq2seq (heredado de IndicTrans2-en-indic-dist-200M) |
| Parametros totales | 274.584.576 (según safetensors del repo); 211.776.512 declarados para la revisión del modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación limitada a max 256 tokens en los ejemplos de la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (eng_Latn) → telugu (tel_Telu) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tune de parámetros completos (full-parameter) sobre `ai4bharat/indictrans2-en-indic-dist-200M`, un transformador seq2seq destilado de la familia IndicTrans2 de AI4Bharat, orientado a la traducción del inglés hacia lenguas índicas. No se introducen cambios arquitectónicos: la revisión base usada es la `2cfd0a20057756d756bf3e53528f492afc52f91a`, con exportación verificada mediante un manifiesto SHA256 congelado.

El entrenamiento consistió en 100 pasos de optimizador AdamW con learning rate 2e-6, batch size 2, acumulación 1 y semilla 42, usando PyTorch Lightning 2.6.6. Se procesaron aproximadamente 200 ejemplos, menos de una época sobre las 7.673 filas de entrenamiento. Los datos proceden del corpus AI4Bharat BPCC-H-Daily Telugu (componente Daily, especificado con licencia CC-BY-4.0 en su README), con 8.511 pares limpiados y divididos en 7.673 de entrenamiento, 412 de validación y 426 de test mediante hash de fuente normalizada. Se aplicó descontaminación exacta contra IN22 sin solapamientos encontrados, aunque los casi-duplicados y la exposición previa al preentrenamiento upstream quedan sin resolver. La selección del checkpoint exportado se hizo por pérdida de validación; la ejecución de 1.000 pasos usó una Tesla T4, mientras que la de 100 pasos se ejecutó en CPU. No hay RLHF ni DPO.

## Capacidades

- Traducción automática texto a texto del inglés (escritura latina) al telugu (tel_Telu), mediante pipeline `text2text-generation` / `translation`.
- Mejora marginal respecto al modelo base en dominio de noticias diarias (BPCC) y en conversación (IN22 conversation), según evaluación held-out del propio autor.
- Requiere preprocesamiento y postprocesado con `IndicProcessor` (IndicTransToolkit) para resultados correctos.
- Requiere código personalizado revisado (`trust_remote_code=True`) para cargar tokenizer y modelo.
- No es un sistema de conversación completo: no incluye ASR ni TTS.
- No hay soporte declarado de tool calling, agentes, razonamiento multi-paso ni capacidades multimodales.

## Casos de uso

- Traducción de noticias diarias del inglés al telugu: el modelo se ha ajustado específicamente sobre BPCC-H-Daily, por lo que es adecuado para traducir titulares y párrafos de prensa en ese dominio.
- Traducción de diálogo conversacional: en el subconjunto IN22 conversation muestra una mejora estadísticamente significativa (chrF++ +0,02 a +0,41) frente al modelo base, útil para localizar chats o subtítulos informales.
- Investigación reproducible en adaptación de modelos de traducción: incluye manifiestos de hashes, corpus hashes, firmas exactas de métricas e informes en `benchmarks/`, ideal como referencia metodológica.
- Punto de partida para fine-tunes más profundos al telugu: al partir del modelo destilado de 200M, permite experimentos de bajo coste en CPU o GPU modestas.
- Prototipado de localización en dispositivos de bajos recursos: la ejecución de 100 pasos se hizo en CPU y la inferencia de evaluación también, lo que sugiere viabilidad en entornos sin GPU (aunque el autor no reclama aún "edge-readiness").
- Integración en pipelines de traducción batch de textos cortos: con decodificación por haces (3 beams) y máximo de 256 tokens, adecuado para lotes de frases y párrafos, no de documentos largos.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados por terceros). Validación interna (412 filas, usada para selección de checkpoint, por lo que no es una medida imparcial): chrF++ 55,0722 y BLEU 22,7545 (SacreBLEU 2.6.0, BLEU 13a sensible a mayúsculas, chrF++ orden de caracteres 6 / orden de palabras 2; 3 beams, máx. 256 tokens, CPU con 4 hilos). Baseline upstream en la misma validación: chrF++ 54,1698 y BLEU 21,3407.

Evaluación held-out sobre checkpoint congelado (mismo entorno de CPU y decodificación):

| Corpus | N | Base chrF++ | Este modelo chrF++ | Base BLEU | Este modelo BLEU |
|---|---:|---:|---:|---:|---:|
| BPCC internal test | 426 | 53,6451 | 54,6040 | 19,9198 | 21,5296 |
| IN22 conversation | 1503 | 44,6710 | 44,8902 | 13,0600 | 13,5208 |
| IN22 general | 1024 | 51,4335 | 51,3796 | 18,2014 | 18,2476 |

Intervalos percentiles del 95% para la delta de chrF++ (1000 remuestreos emparejados, exploratorios): BPCC [+0,3810, +1,6155], conversación [+0,0173, +0,4114], general [−0,1698, +0,0633]. Sin ajuste por comparaciones múltiples ni incertidumbre por semilla de entrenamiento. La mejora en dominio general no está demostrada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible explícitamente; con ~275M de parámetros en fp32 (pesos safetensors, repo de 1,1 GB), se estima del orden de 1-1,5 GB de RAM/VRAM en precisión completa.
- GPU recomendadas: ninguna en particular; el propio entrenamiento de 100 pasos y toda la evaluación se realizaron en CPU. La ejecución de 1.000 pasos usó una Tesla T4.
- Consumer GPU: no es necesaria; el modelo cabe sobradamente en cualquier GPU moderna e incluso funciona en CPU (entorno de evaluación: CPU con 4 hilos).
- Despliegue: Transformers 4.51.3 con `trust_remote_code=True`, IndicTransToolkit 1.1.1 y PyTorch 2.6.0 (configuración testada para recarga offline). No hay soporte declarado de vLLM, llama.cpp, Ollama o TGI; al ser un modelo seq2seq con código personalizado, llama.cpp y Ollama no son aplicables directamente.
- Latencia y throughput: no disponibles; solo se conoce el protocolo de decodificación (3 beams, máx. 256 tokens, batch 4, 4 hilos de CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InferEdge IndicTrans2 en-te 100 steps (este) | ~275M (safetensors) | en→te, fine-tune dominio BPCC-Daily | no disponible | MIT | Hugging Face, código custom requerido |
| ai4bharat/indictrans2-en-indic-dist-200M (base) | 211,8M (declarado) | en→22 lenguas índicas | no disponible | MIT | Hugging Face, código custom |
| ai4bharat/indictrans2-en-indic-1B | ~1.180M | en→22 lenguas índicas | no disponible | MIT | Hugging Face, código custom |

Respecto al modelo base, este checkpoint ofrece una mejora pequeña pero medible en dominio BPCC y conversacional, a costa de estar especializado en un único par lingüístico. Frente a la variante de 1B de IndicTrans2, es mucho más ligero y fácil de desplegar, aunque probablemente con menor calidad general; no se han publicado comparaciones directas entre ambos.

## Limitaciones y advertencias

- Mejora de dominio limitada y no demostrada en dominio general: el intervalo de confianza en IN22 general incluye el efecto nulo; el propio autor indica que "la mejora en dominio general no está probada".
- La validación se usó para selección del checkpoint, por lo que las cifras de validación no son una estimación imparcial del rendimiento final.
- Entrenamiento mínimo: solo ~200 ejemplos en 100 pasos, muy por debajo de una época; el riesgo de sobreajuste al dominio BPCC-Daily es alto.
- Descontaminación incompleta: los casi-duplicados y la posible exposición previa durante el preentrenamiento upstream no están resueltos.
- Pendientes de verificar: revisión humana nativa en telugu, experimentos con múltiples semillas, evaluación confirmatoria independiente y mediciones de RAM/latencia/energía en dispositivos concretos.
- Riesgo de alucinación en traducción: no evaluado específicamente; no hay garantías de fidelidad en textos fuera del dominio de noticias y conversación.
- Requiere `trust_remote_code=True`: hay que fijar un commit del Hub, inspeccionar el código incluido y verificar los hashes de los ficheros congelados antes de habilitarlo.
- La licencia CC-BY-4.0 del componente Daily de BPCC no debe generalizarse a otros componentes de BPCC; los datos de entrenamiento no se redistribuyen en el repo.
- No es un sistema de conversación completo (sin ASR/TTS) y no hay declaraciones de preparación para producción, estado del arte ni superioridad universal.
- Métricas no verificadas por terceros y sin ajuste por comparaciones múltiples.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ravivarmapatturi/inferedge-indictrans2-en-te-100steps-v1
- Modelo base: https://huggingface.co/ai4bharat/indictrans2-en-indic-dist-200M
- Repositorio GitHub de AI4Bharat IndicTrans2: https://github.com/AI4Bharat/IndicTrans2
- Paper de IndicTrans2: https://arxiv.org/abs/2305.16307
- Paper de SacreBLEU: https://aclanthology.org/W18-6319/
