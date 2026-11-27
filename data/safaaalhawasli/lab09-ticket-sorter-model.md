# SafaaAlhawasli/lab09-ticket-sorter-model

## Resumen

El modelo `lab09-ticket-sorter-model`, publicado por SafaaAlhawasli bajo el nombre de "Lakeshore Ticket Sorter", es un clasificador de texto en ingles obtenido mediante ajuste fino completo (full fine-tuning) de DistilBERT base uncased. Su proposito es sugerir una cola de atencion (billing, bike_fault, station o account) para mensajes cortos de soporte relacionados con un servicio de bicicletas compartidas. Se trata de un experimento academico (identificado como "lab09") con un conjunto de datos sintetico, no de un modelo listo para produccion.

El modelo parte de `distilbert/distilbert-base-uncased`, una version destilada de BERT con 6 capas y 66.955.548 parametros, y anade una cabeza de clasificacion sobre la representacion del token `[CLS]`. El checkpoint publicado ocupa 0,3 GB en formato safetensors, lo que lo hace trivial de desplegar en cualquier maquina, incluso sin GPU.

Su relevancia es limitada: sirve como referencia didactica de un pipeline de clasificacion de tickets con un baseline (clase mayoritaria) y un modelo clasico (TF-IDF + regresion logistica) como comparadores. No debe confundirse con un modelo de lenguaje generativo ni usarse fuera del dominio de mensajes cortos en ingles sobre bicicletas compartidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas, 12 cabezas, hidden 768) con cabeza de clasificacion |
| Parametros totales | 66.955.548 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (limite de DistilBERT base; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32; admite cuantizacion dinamica a int8 mediante PyTorch) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

DistilBERT es un transformer encoder destilado de BERT base: 6 capas, 12 cabezas de atencion, dimension oculta 768 y vocabulario WordPiece de 30.522 tokens. Sobre la salida del token `[CLS]` se anade una capa lineal con tantas salidas como clases (cuatro: billing, bike_fault, station, account). El checkpoint publicado utiliza ajuste fino completo de todos los parametros, no solo de la cabeza.

El entrenamiento se realizo sobre 300 ejemplos estratificados de un dataset sintetico ("Lakeshore Bike Share"), divididos 60/20/20 antes del ajuste. La seleccion de epoca y variante se hizo sobre el conjunto de validacion. La configuracion final fue: semilla de muestreo 22, 3 epocas y learning rate 5e-05. No se documenta el uso de RLHF, DPO ni tecnicas de aumentacion de datos. La model card advierte que el texto de entrenamiento es inventado y repite plantillas, por lo que el modelo aprende patrones superficiales mas que semantica real.

## Capacidades

- Clasificacion de texto en ingles en cuatro categorias cerradas: billing, bike_fault, station y account.
- Entrada de mensajes cortos (una o pocas frases); no es un modelo generativo ni mantiene conversaciones.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue: ninguna; solo ingles.
- No dispone de modo "thinking", vision ni audio.
- La salida es una distribucion de probabilidad sobre las cuatro clases, aunque la model card advierte que las puntuaciones no estan calibradas como estimaciones de confianza.

## Casos de uso

- Triaje de tickets de soporte en un servicio de bicicletas compartidas: el modelo recibe el texto del mensaje y sugiere una cola (billing, bike_fault, station, account); un agente humano confirma o corrige la sugerencia. Es el uso previsto por el autor.
- Prototipado rapido de clasificadores de tickets: sirve como punto de partida para validar un pipeline de etiquetado antes de invertir en un dataset real y un modelo mayor.
- Baseline en experimentos academicos: permite comparar un transformer destilado frente a TF-IDF + regresion logistica (0,871 de accuracy) y frente a la clase mayoritaria (0,287), con la misma particion de datos.
- Enrutamiento de correos de bajo volumen: con 0,3 GB y 66 M de parametros, se puede ejecutar en CPU en un contenedor pequeno y enrutar mensajes entrantes a la cola adecuada.
- Filtrado previo en un sistema de monitorizacion: clasificar mensajes cortos de usuarios para detectar rapidamente incidencias de tipo bike_fault o station y priorizar su revision.
- Demostracion docente de fine-tuning: el checkpoint y la model card documentan hiperparametros, particion y resultados, lo que lo hace util como ejemplo reproducible en un curso de NLP.
- Etiquetado asistido en anotacion: sugerir una etiqueta inicial a anotadores humanos para acelerar el etiquetado de un corpus nuevo, siempre con revision manual.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test sintetico retenido:

| Metodo | Accuracy | Macro F1 |
|---|---:|---:|
| full fine-tuning (checkpoint publicado) | 0,900 | 0,902 |
| most common (baseline) | 0,287 | 0,112 |
| tfidf logistic | 0,871 | 0,873 |

No se han publicado resultados en benchmarks estandar (MMLU, GLUE, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32; aproximadamente 0,3-0,5 GB con cuantizacion int8.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, T4, RTX 3060 o superior); no requiere A100 ni H100.
- Cabe holgadamente en GPU de consumo e incluso en CPU; el modelo completo ocupa 0,3 GB en disco.
- Opciones de despliegue: PyTorch + Transformers, ONNX Runtime, TorchScript, Hugging Face Inference Endpoints, FastAPI con `pipeline("text-classification")`. No aplica vLLM ni llama.cpp por no ser un modelo generativo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| lab09-ticket-sorter-model | 66,9 M | 512 tokens (limite de DistilBERT) | Clasificacion de tickets (4 clases) | apache-2.0 | Hugging Face |
| distilbert-base-uncased | 66,9 M | 512 tokens | Modelo base (MLM) | apache-2.0 | Hugging Face |
| bert-base-uncased | 110 M | 512 tokens | Modelo base (MLM) | apache-2.0 | Hugging Face |
| TF-IDF + regresion logistica (baseline del autor) | no aplica | no aplica | Clasificacion de tickets | no aplica | Implementacion local |

La comparativa se limita al mismo linaje (DistilBERT) y al baseline clasico incluido por el autor. No se dispone de datos de benchmarks frente a otros clasificadores ajustados para esta tarea.

## Limitaciones y advertencias

- Entrenado con datos sinteticos e inventados que repiten plantillas; el rendimiento en clientes reales no esta establecido.
- Solo admite ingles; no se ha evaluado en otros idiomas ni en variantes del ingles no vistas.
- Las puntuaciones de salida no estan calibradas como estimaciones de confianza; no deben usarse como probabilidades fiables en produccion.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea en mensajes vagos o que mezclan temas.
- El conjunto de entrenamiento es muy pequeno (300 ejemplos), lo que limita la generalizacion y aumenta el riesgo de sobreajuste a plantillas.
- Sesgos conocidos: no documentados; al ser datos sinteticos, no se han analizado sesgos demograficos ni linguisticos.
- Licencia apache-2.0: permite uso comercial y modificacion, pero el autor no ofrece garantias sobre el rendimiento.
- Uso previsto restringido a sugerencia con revision humana; no debe emplearse como clasificador automatico sin supervision en un sistema de atencion al cliente real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SafaaAlhawasli/lab09-ticket-sorter-model
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentacion de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
