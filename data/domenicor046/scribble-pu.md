# domenicor046/scribble-pu

## Resumen

ScribblePU es un conjunto de checkpoints para detección de tinta en pergaminos carbonizados de Herculano, desarrollado por Domenico Russo en el contexto del Vesuvius Challenge. El modelo aborda un problema específico: el entrenamiento de modelos de tinta con aprendizaje positivo-no etiquetado (positive-unlabeled, PU), donde el anotador traza una línea de un píxel sobre las zonas de tinta segura y deja el resto sin etiquetar, permitiendo afinar un modelo propio en pocos minutos en lugar de requerir segmentaciones densas.

Los checkpoints publicados son variantes de Reader V3 reajustadas con ScribblePU en 15 minutos a partir de líneas centrales finas sobre letras de otros pergaminos. Se distribuyen como pesos `.pth` (PyTorch) compatibles con el comando de inferencia `ink_9um` del paquete `koine_machines.inference.infer`, con una licencia MIT que permite uso comercial.

La relevancia actual reside en que reduce drásticamente el coste de anotación para lectura virtual de pergaminos: en lugar de etiquetar volúmenes completos, basta con trazos finos, y los checkpoints resultantes mejoran la separación de letras en filas densas y con alta señal, como la fila First Letters del `PHerc. 0306B`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoints de Reader V3, red de segmentacion de tinta; detalles no publicados) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos `.pth` en precision original) |
| Idiomas soportados | no disponible (no es un modelo linguistico) |
| Licencia | MIT |
| Formato de pesos | `.pth` (PyTorch) |

## Arquitectura y entrenamiento

Los checkpoints derivan de Reader V3, el modelo de lectura de tinta del equipo, reajustado mediante aprendizaje positivo-no etiquetado (PU). La innovación principal es el esquema de anotación: el usuario dibuja una línea de un píxel donde está seguro de que hay tinta y deja el resto sin etiquetar; el modelo aprende a partir de esas etiquetas positivas escasas sin necesidad de negativos explícitos. El reajuste es rápido: `reader-pu-deconly-soup50.pth` congela el encoder de V3 y ajusta solo el decoder en 6,9 minutos, mientras `reader-pu-bhand.pth` requiere 15 minutos de ajuste.

El checkpoint `reader-pu-deconly-soup50.pth` se obtiene mezclando al 50/50 el decoder ajustado con V3; `reader-pu-soup50.pth` mezcla al 50/50 `reader-pu-bhand` con V3. La salida se mantiene en la escala 0-255 de Reader V3. El repositorio incluye además la pérdida de entrenamiento como término drop-in para `koine_machines`, un parche de villa, tests y un script que verifica cada número publicado.

## Capacidades

- Detección de tinta en volúmenes CT de pergaminos carbonizados (Herculaneum).
- Segmentación de trazos con separación de letras en filas densas y de alta señal.
- Inferencia sobre superficies `.zarr` con solapamiento configurable y fusión Hann.
- Modo de dirección bidireccional (`--direction both`) para mejorar la cobertura.
- Reajuste rápido con anotaciones tipo scribble (líneas de un píxel) mediante PU learning.
- Compatibilidad drop-in con el pipeline `koine_machines.inference.infer` y el modelo base Reader V3.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües.

## Casos de uso

- Lectura virtual de pergaminos de Herculano: aplicar los checkpoints sobre superficies CT para obtener mapas de tinta en escala 0-255 y localizar texto legible en rollos carbonizados.
- Mejora de separación de letras en filas congestionadas: usar `reader-pu-bhand.pth` en filas como `0306B` donde los trazos fusionados de V3 se adelgazan y los huecos entre letras se abren.
- Segunda vista complementaria: ejecutar `reader-pu-deconly-soup50.pth` junto a Reader V3 para obtener una lectura alternativa y contrastar interpretaciones en zonas ambiguas.
- Afinamiento propio con anotación mínima: dibujar líneas de un píxel sobre letras conocidas de otros pergaminos y reajustar el decoder en minutos para adaptar el modelo a un nuevo rollo o estilo caligráfico.
- Investigación en PU learning aplicado a imágenes: usar la pérdida drop-in y los scripts del repositorio para reproducir y verificar los resultados numéricos publicados.
- Validación de pipelines de lectura: integrar los checkpoints en pruebas automatizadas del comando `ink_9um` para comprobar regresiones en la detección de tinta.

## Benchmarks y rendimiento

| Metrica | Dataset | Reader V3 | ScribblePU |
|---|---|---|---|
| Separacion de letras (M1) | PHerc. 0009B (held-out) | 0.8371 | 0.8829 |
| Separacion de letras (M1) | PHerc. 1667 w029 (held-out) | 0.8221 | 0.9145 |

Los valores corresponden a la metrica M1 de separación de letras sobre datos retenidos, según la model card. No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamaño del repositorio es de 0,8 GB, lo que sugiere que los pesos caben en GPU de consumo, pero no se confirma.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; el tamaño de los pesos (0,8 GB) indica que es plausible, pero no se especifica.
- Opciones de despliegue: comando `python -m koine_machines.inference.infer` con pesos `.pth`; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ScribblePU (estos checkpoints) | no disponible | no disponible | M1 0.8829 / 0.9145 en held-out | MIT | Hugging Face |
| Reader V3 (base) | no disponible | no disponible | M1 0.8371 / 0.8221 en held-out | no disponible | Referenciado en la model card |
| Otros modelos de deteccion de tinta | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de detección de tinta en pergaminos en la documentación proporcionada.

## Limitaciones y advertencias

- Los checkpoints están ligados al pipeline `koine_machines` y al comando `ink_9um`; no son modelos autónomos ni exportables a otros formatos sin trabajo adicional.
- La salida está en la escala 0-255 de Reader V3: umbralizar a 128 no es la forma correcta de interpretar el mapa; debe examinarse el mapa en bruto.
- El reajuste se realizó sobre letras de otros pergaminos; el comportamiento en rollos con estilos caligráficos muy distintos no está documentado.
- No se publican métricas de sesgo, robustez ante ruido CT ni comportamiento en regiones de baja señal.
- Riesgo de alucinación de trazos: al ser un modelo de segmentación, puede producir falsos positivos de tinta en zonas ambiguas; no se cuantifica en la model card.
- La licencia MIT permite uso comercial, pero no se especifican restricciones sobre los datos de entrenamiento subyacentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por terceros.
- No se documentan requisitos de hardware ni latencias, lo que dificulta planificar producción.

## Enlaces

- Hugging Face: https://huggingface.co/domenicor046/scribble-pu
- Repositorio GitHub (pérdida, parche, tests y scripts de verificación): https://github.com/DomRusso2/scribble-pu
- Vesuvius Challenge (contexto del proyecto): no disponible en la información proporcionada
- Paper o blog del autor: no disponible en la información proporcionada
