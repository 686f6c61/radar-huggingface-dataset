# mel0k1/Noxl

## Resumen

Noxl es un modelo de lenguaje hibrido no-transformer desarrollado por el usuario mel0k1 y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un proof-of-concept que combina varias familias de arquitecturas recurrentes y de atencion lineal en una sola pila: capas de espacio de estados selectivo (Mamba-2 SSD), regla delta con compuerta (Gated DeltaNet), atencion lineal con compuerta al estilo RWKV-7 y memoria neural de largo plazo al estilo Titans, intercaladas de forma dispersa con bloques feed-forward de mezcla de expertos (MoE). No emplea atencion softmax en ninguna capa.

El modelo tiene 3.130.380 parametros totales, un vocabulario de 65 tokens a nivel de caracter (tiny shakespeare) y una dimension de modelo de 128 con 6 capas. Su proposito declarado no es competir como modelo de lenguaje, sino demostrar que la pila hibrida entrena de forma limpia, que sus rutas recurrente y paralela coinciden exactamente y que genera texto coherente a nivel de caracter con un presupuesto minimo de parametros.

Es relevante ahora como referencia tecnica para investigadores que exploran alternativas a la atencion softmax: cada mixer mantiene un estado recurrente de tamano fijo, lo que hace que el entrenamiento sea lineal en la longitud de secuencia y la generacion sea O(1) por token sin cache KV. El checkpoint se entreno en unos 5,5 minutos sobre una CPU de 2 nucleos, lo que lo convierte en un banco de pruebas accesible para validar implementaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida no-transformer: Mamba-2 SSD, Gated DeltaNet, GLA estilo RWKV-7 y Titans, con MoE intercalado |
| Parametros totales | 3.130.380 |
| Parametros activos | top-2 de 4 expertos + 1 compartido en capas MoE (1, 3 y 5); total de expertos no disponible |
| Longitud de contexto | no disponible (entrenado con secuencias de 128 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrenado a nivel de caracter sobre tiny shakespeare, en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint PyTorch; embeddings atados a la LM head) |

## Arquitectura y entrenamiento

La arquitectura es una pila de 6 capas con d_model=128, 4 cabezas de dimension 32 y d_state=32 con n_groups=2. El orden de capas es ssd, deltanet, ssd, gla, ssd, titans. Las capas 0, 2 y 4 incorporan FFN densas con SwiGLU; las capas 1, 3 y 5 usan MoE con top-2 de 4 expertos mas 1 experto compartido. Cada mixer mantiene un estado recurrente de tamano fijo, lo que elimina el cache KV en generacion y hace que el coste de entrenamiento sea lineal en la longitud de secuencia. Los embeddings estan atados a la LM head, por lo que el tensor `lm_head.weight` no se guarda en el checkpoint y debe reutilizarse el de embeddings al cargar.

El entrenamiento se realizo sobre tiny shakespeare a nivel de caracter (1115K caracteres), durante 550 pasos con batch de 8 y secuencia de 128, optimizador AdamW con learning rate 1e-3 y schedule coseno, y weight decay 0.1. La perdida paso de 4,27 inicial a 1,55 final. El entrenamiento completo se ejecuto en una CPU de 2 nucleos en aproximadamente 5,5 minutos. Las implementaciones son PyTorch de referencia, no kernels fusionados. No se documenta uso de RLHF, DPO ni datos de instruccion.

## Capacidades

- Generacion de texto a nivel de caracter en ingles arcaico/estilo Shakespeare, con coherencia limitada a secuencias cortas.
- Modelado autoregresivo con estado recurrente de tamano fijo: generacion O(1) por token sin cache KV.
- Entrenamiento lineal en longitud de secuencia gracias a los mixers recurrentes y de atencion lineal.
- Verificacion de equivalencia entre rutas recurrente y paralela de la pila hibrida (objetivo declarado del checkpoint).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues declaradas.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Validacion de implementaciones de arquitecturas hibridas: sirve como referencia para comprobar que una implementacion propia de Mamba-2 SSD, Gated DeltaNet, GLA o Titans produce las mismas salidas que la de referencia en un checkpoint pequeno y reproducible.
- Investigacion sobre alternativas a la atencion softmax: permite experimentar con mezclas de mixers recurrentes y de atencion lineal en un entorno de bajo coste (5,5 minutos en CPU) antes de escalar.
- Pruebas de entrenabilidad y estabilidad: la curva de perdida y el checkpoint permiten comparar inicializaciones, schedules o combinaciones de capas con un coste minimo.
- Docencia y divulgacion: ejemplo didactico de una pila no-transformer completa con MoE, util para explicar espacio de estados, reglas delta y atencion lineal con un modelo que cabe en cualquier maquina.
- Benchmark de inferencia sin cache KV: sirve para medir latencia por token y consumo de memoria de un modelo con estado recurrente fijo frente a un transformer equivalente.
- Generacion de texto creativo a nivel de caracter como demo: produce fragmentos estilo Shakespeare para ilustrar el comportamiento del modelo, sin pretension de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de entrenamiento (4,27 inicial, 1,55 final) sobre tiny shakespeare a nivel de caracter.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para 3,13M parametros; el checkpoint ocupa practicamente 0 GB en el repositorio.
- GPU recomendadas: no requiere GPU; se entreno y ejecuta en CPU.
- Cabe en cualquier GPU consumer e incluso en CPU de 2 nucleos.
- Opciones de despliegue: PyTorch con el paquete `noxl` del repositorio de GitHub; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el entrenamiento de 550 pasos con batch 8 y secuencia 128 tardo aproximadamente 5,5 minutos en CPU de 2 nucleos.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (hibridos no-transformer de ~3M parametros a nivel de caracter) ni se aportan datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Modelo proof-of-concept: no es un modelo de lenguaje competitivo; su objetivo es demostrar entrenabilidad y correccion, no calidad de generacion.
- Entrenado solo 550 pasos sobre 1115K caracteres de tiny shakespeare; el vocabulario de 65 tokens y el dominio limitado restringen severamente cualquier uso real.
- Generacion a nivel de caracter con coherencia limitada; el ejemplo de la model card muestra texto gramaticalmente incorrecto.
- Riesgo alto de alucinacion y de salidas sin sentido fuera del dominio de Shakespeare.
- Sin datos sobre sesgos; el corpus de entrenamiento es un unico texto literario en ingles.
- Idiomas: solo ingles a nivel de caracter; no hay soporte multilingue.
- Implementaciones de referencia en PyTorch, no kernels fusionados; el rendimiento no representa el de una implementacion optimizada.
- Licencia Apache 2.0 permite uso comercial, pero la calidad y el alcance del modelo lo hacen inadecuado para produccion.
- Los embeddings estan atados a la LM head; es necesario reutilizar `embed.weight` al cargar el checkpoint para evitar errores de state_dict.

## Enlaces

- Hugging Face: https://huggingface.co/mel0k1/Noxl
- Repositorio de codigo: https://github.com/mel0k1/Noxl
