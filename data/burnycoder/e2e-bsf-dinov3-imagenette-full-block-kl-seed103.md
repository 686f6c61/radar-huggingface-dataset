# BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed103

## Resumen

El modelo `BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed103` no es un modelo generativo de lenguaje, sino un *featurizer* de visión entrenado como autoencoder disperso por bloques (block-sparse autoencoder, BSF) sobre las representaciones de un clasificador de parches DINOv3. Lo desarrolla el usuario BurnyCoder en el contexto de un estudio prerregistrado sobre interpretabilidad de representaciones visuales, y se apoya en el backbone `facebook/dinov3-vitb16-pretrain-lvd1689m` (ViT-B/16), que no se redistribuye con el artefacto.

El objetivo del artefacto es sustituir la lectura de un clasificador fijo de diez clases (Imagenette) por una representación dispersa y estructurada por bloques que preserve la fidelidad de la salida del profesor. Se trata de un experimento de interpretabilidad mecanicista, no de un modelo listo para producción: el propio autor indica que una KL más baja solo mide la preservación de ese *readout* concreto y no establece conceptos semánticos ni fidelidad completa a DINOv3.

El peso publicado contiene únicamente los pesos del BSF, la normalización fija y el clasificador entrenado, con 9.599.498 parámetros en formato safetensors. La comparación direccional entre variantes locales y KL resultó no concluyente (intervalo de confianza al 95 % que incluye cero), por lo que debe interpretarse como un resultado exploratorio con potencia estadística insuficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder disperso por bloques (block-sparse featurizer) sobre ViT-B/16 de DINOv3; artefactos escalares como featurizers de ancho uno con signo, no SAE ReLU convencionales |
| Parametros totales | 9.599.498 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; opera sobre parches de imagen, no sobre secuencias de texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta declarada por el autor) |
| Licencia | MIT (no relicencia el backbone DINOv3, que requiere acceso autorizado y licencia propia) |
| Formato de pesos | safetensors (`model.safetensors`); el checkpoint de entrenamiento local conserva además estado del optimizador y RNG |

## Arquitectura y entrenamiento

El modelo es un *featurizer* de bloques entrenado desde cero (*from scratch*) para un clasificador de parches DINOv3/Imagenette fijo. El perfil de entrenamiento es `full` y se completó 1 época. La formulación es de dispersión por bloques en variedad de Grassmann (*Grassmannian block-sparse*), con un objetivo que combina una KL de fidelidad respecto al profesor y una componente local; los artefactos escalares se describen como featurizers de ancho uno con signo, lo que lo aleja del SAE ReLU estándar.

El estudio es acotado y prerregistrado. La comparación principal mide la diferencia pareada media entre la variante local y la variante KL: 0,00254596 nats/imagen sobre 5 semillas, con un intervalo del 95 % de [-0,00325909, 0,008351]. Como el intervalo incluye cero, la comparación direccional es no concluyente y el objetivo de potencia del piloto no se alcanzó. El entrenamiento KL presentó una divergencia media de salida menor. El artefacto incluye `config.json` con revisiones, arquitectura, objetivo, semilla, preprocesado e identidades de entrenamiento; `manifest.json` y `duplicate_audit.json` con asignaciones de imágenes y evidencia de exclusión; y `teacher.json` con la selección del clasificador.

## Capacidades

- Extracción de características visuales dispersas por bloques a partir de imágenes RGB, mediante `VisionFeaturizer` del paquete `e2e_bsf`.
- Predicción de probabilidades sobre las diez clases de Imagenette (el orden de clases sigue el de torchvision).
- Preservación del *readout* de un clasificador de parches DINOv3 fijo, medida mediante KL en nats/imagen.
- Representación estructurada por bloques orientada al análisis de interpretabilidad mecanicista.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto.
- No dispone de modo *thinking*, visión generativa, audio ni capacidades multilingües más allá de la etiqueta `en`.
- No está diseñado para acelerar la inferencia: el autor lo descarta explícitamente.

## Casos de uso

- Investigación en interpretabilidad mecanicista: analizar cómo se organizan las características de un ViT-B/16 de DINOv3 en una base dispersa por bloques, comparando la estructura de bloques con la de SAE ReLU convencionales.
- Auditoría de *readouts* de clasificadores: verificar cuánta información de un clasificador de diez clases se conserva al comprimir sus activaciones, usando la KL medida (0,036707442 nats/imagen) como referencia.
- Reproducción de estudios prerregistrados: el paquete incluye manifiesto, auditoría de duplicados y configuración que permiten replicar asignaciones de imágenes y condiciones de entrenamiento.
- Comparación de objetivos de entrenamiento: evaluar la diferencia entre una variante local y una variante KL sobre las mismas semillas, con intervalos pareados documentados.
- Docencia y divulgación sobre SAE y dispersión por bloques: el artefacto es pequeño (9,6 M de parámetros) y se carga con una API mínima de inferencia.
- Base para experimentos derivados: servir como punto de partida para entrenar *featurizers* con más épocas o mayor potencia estadística sobre el mismo backbone DINOv3.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| KL retenida (held-out) | 0,036707442 nats/imagen |
| Precisión | 99,4323 % |
| MSE de parche normalizado | 0,78931022 |
| Diferencia pareada media local menos KL | 0,00254596 nats/imagen (5 semillas) |
| Intervalo del 95 % (nivel de semilla) | [-0,00325909, 0,008351] |
| Epocas completadas | 1 |
| Perfil | full |

No se han publicado resultados de benchmarks en la informacion disponible para comparaciones con MMLU, HumanEval, GSM8K ni métricas estándar de visión como ImageNet top-1, ya que el artefacto no es un modelo generativo ni un clasificador de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 9,6 M de parámetros y pesos safetensors, el artefacto es muy ligero, pero requiere cargar el backbone DINOv3 ViT-B/16 para operar.
- GPU recomendadas: no disponible; cualquier GPU con memoria suficiente para el ViT-B/16 de DINOv3 debería bastar, pero no se especifican modelos concretos.
- GPU de consumo: no se confirma compatibilidad con RTX 4090 u otras GPU de consumo; el backbone DINOv3 condiciona el requisito real.
- Opciones de despliegue: el autor documenta únicamente el paquete `e2e_bsf` con `VisionFeaturizer`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este artefacto).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2e-bsf-dinov3-imagenette-full-block-kl-seed103 | 9.599.498 | no aplica (visión) | KL 0,0367 nats/imagen; precisión 99,43 % | MIT (backbone aparte) | HuggingFace, 23 descargas |
| SAE ReLU convencional sobre DINOv3 | no disponible | no aplica | no disponible | no disponible | no disponible |
| Block-sparse featurizer de Goodfire | no disponible | no aplica | no disponible | no disponible | repositorio público |
| DINOv3 ViT-B/16 (backbone) | no disponible en la información | no aplica | no disponible | licencia propia de DINOv3 | acceso autorizado |

No se dispone de datos comparativos de rendimiento entre estas alternativas en la información proporcionada; la comparativa se limita a disponibilidad y licencia.

## Limitaciones y advertencias

- La KL más baja solo mide la preservación del *readout* de diez clases; no establece conceptos semánticos ni fidelidad completa a DINOv3.
- El estudio es exploratorio: no se alcanzó el objetivo de potencia del piloto y la comparación direccional es no concluyente (el intervalo incluye cero).
- Solo se completó 1 época de entrenamiento, lo que limita la madurez del artefacto.
- El artefacto excluye los pesos de DINO y las imágenes; se requiere acceso autorizado al backbone y su licencia separada. La licencia MIT no relicencia DINOv3.
- No está pensado para acelerar la inferencia; el autor lo descarta explícitamente.
- Riesgo de sesgo y alucinación: no aplica en el sentido generativo, pero el clasificador hereda los sesgos del profesor DINOv3 y del conjunto Imagenette.
- Idioma: etiqueta `en`, sin soporte multilingüe declarado.
- Uso comercial: la licencia MIT cubre el artefacto, pero el uso del backbone DINOv3 queda sujeto a su licencia propia.
- El orden de clases sigue torchvision Imagenette; cualquier integración debe respetarlo para no producir predicciones mal etiquetadas.

## Enlaces

- HuggingFace: https://huggingface.co/BurnyCoder/e2e-bsf-dinov3-imagenette-full-block-kl-seed103
- Repositorio del proyecto: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers
- Prerregistro: https://github.com/BurnyCoder/end-to-end-block-sparse-featurizers/blob/main/docs/preregistration.md
- Paper BSF: https://arxiv.org/abs/2606.25234
- Paper end-to-end SAE: https://arxiv.org/abs/2405.12241
- Código de Goodfire: https://github.com/goodfire-ai/block-sparse-featurizer
- Modelo base: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
