# Atlas3D/Qwen3.8-27B-Omni-Platos-Keys

## Resumen

Qwen3.8-27B-Omni-Platos-Keys es un paquete de pesos publicado por Atlas3D que no contiene un modelo generativo completo, sino un conjunto de "Platos Keys": proyecciones de acoplamiento (bridges) entrenadas en forma cerrada y serializadas en FP16 que conectan el tronco congelado de Qwen/Qwen3.8-27B con varios decodificadores multimodales externos. Segun la model card, el paquete permite enrutar las representaciones internas del tronco Qwen3.8-27B hacia MiniMax-H3 (generacion de imagen y de video con audio, modalidad FL2VA), YuE2-3B (musica simbolica) y Qwen3-TTS (estilo VoiceDesign).

El interes tecnico esta en el enfoque: el autor lo etiqueta como "zero-gradient", es decir, los ficheros se obtienen mediante ajuste en forma cerrada en precision FP64 y despues se serializan en FP16, sin un ciclo de entrenamiento por descenso de gradiente convencional sobre el modelo base. Se trata, por tanto, de un artefacto de investigacion sobre injerto multimodal (grafting) mas que de un modelo listo para produccion.

El repositorio ocupa solo 0,6 GB, coherente con un conjunto de matrices de proyeccion y no con un modelo de 27B parametros. No se dispone de informacion sobre el pipeline, los idiomas soportados ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Bridges de proyeccion sobre tronco transformer congelado (Qwen3.8-27B); no es un modelo completo |
| Parametros totales | No disponible (el repo pesa 0,6 GB; el tronco base Qwen3.8-27B se referencia pero no se incluye) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del tronco Qwen3.8-27B, no especificada) |
| Tipos de cuantizacion | No disponible; pesos serializados en FP16 |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El artefacto no es un transformer entrenado de extremo a extremo, sino una coleccion de matrices de acoplamiento que transforman activaciones del tronco Qwen3.8-27B (congelado, sin gradientes) en el espacio de entrada de tres decodificadores distintos: MiniMax-H3 para imagen y video con audio, YuE2-3B para musica simbolica y Qwen3-TTS para sintesis de voz con estilo. La model card describe el metodo como "closed-form FP64-fitted, FP16-serialized", con la etiqueta `zero-gradient` y el marco `atlas-ingine`.

Los ficheros publicados incluyen `qwen38_to_h3_concat4_platos_key.safetensors` (201 MiB), `qwen38_to_h3_single_tap_platos_key.safetensors` (51 MiB) junto con un control barajado (`b0_shuffled`, 51 MiB), `qwen38_to_yue2_platos_key.safetensors` (81 MiB) y `qwen38_to_mouth_platos_key.safetensors` (161 MiB). El autor documenta un paper v0.9 en el repositorio de GitHub de atlas-ingine y digests SHA-256 en `MANIFEST.sha256.json`. No se detallan volumen de datos de entrenamiento, composicion del dataset ni uso de RLHF o DPO.

## Capacidades

- Enrutamiento de representaciones del tronco Qwen3.8-27B hacia MiniMax-H3 para generacion de imagen y de video con audio (modalidad FL2VA), mediante los bridges `concat4` y `single_tap`.
- Acoplamiento hacia YuE2-3B para generacion de musica simbolica.
- Acoplamiento hacia Qwen3-TTS para sintesis de voz con control de estilo (VoiceDesign), a traves del bridge `to_mouth`.
- El autor reporta que el bridge `to_mouth` supera las puertas de estilo en `val_dev` (25/32) con roundtrip exacto (2/2).
- Inyeccion lexica continua: el propio autor la declara frontera de fallo explicita (`overall val_dev FAIL`).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue propias de este paquete.

## Casos de uso

- Investigacion sobre grafting multimodal sin gradientes: reproducir el metodo de ajuste en forma cerrada FP64 sobre un tronco congelado y evaluar la calidad de los bridges con los controles barajados incluidos.
- Experimentacion con generacion de video con audio a partir de un LLM: usar los bridges `qwen38_to_h3_*` para conectar Qwen3.8-27B con MiniMax-H3 en prototipos de texto a video con pista de audio.
- Prototipado de musica simbolica condicionada por texto: emplear `qwen38_to_yue2_platos_key.safetensors` para dirigir YuE2-3B desde representaciones del tronco Qwen.
- Sintesis de voz con estilo: integrar el bridge `to_mouth` con Qwen3-TTS para explorar control de estilo en VoiceDesign, asumiendo la tasa de exito reportada (25/32 en `val_dev`).
- Auditoria de metodos "zero-gradient": comparar los resultados de los bridges reales frente al control `b0_shuffled` para medir cuanto del efecto proviene de la estructura aprendida y cuanto del azar.
- Base para articulos tecnicos y revision por pares: el paquete incluye paper v0.9, manifiesto de hashes y notas de alcance, lo que facilita la verificacion de resultados por terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es interna al autor: el bridge `to_mouth` obtiene 25/32 en las puertas de estilo de `val_dev` con roundtrip exacto 2/2, mientras que la inyeccion lexica continua falla globalmente (`overall val_dev FAIL`).

## Requisitos de hardware

- El repositorio (0,6 GB) cabe holgadamente en cualquier GPU consumer; los ficheros individuales van de 51 MiB a 201 MiB.
- Para ejecutar los bridges es necesario cargar ademas el tronco Qwen3.8-27B y los decodificadores destino (MiniMax-H3, YuE2-3B, Qwen3-TTS), cuyos requisitos no se detallan en la informacion proporcionada.
- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Opciones de despliegue: no disponible (no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se identifican en la informacion proporcionada modelos comparables de la misma categoria (bridges de acoplamiento multimodal sobre tronco congelado) ni se aportan datos de rendimiento frente a alternativas.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el tronco Qwen3.8-27B y los decodificadores destino, que no se incluyen en el repositorio.
- El propio autor declara un fallo explicito en la inyeccion lexica continua (`overall val_dev FAIL`); no debe asumirse control semantico fino del texto de entrada.
- Las puertas de validacion del bridge de voz se superan parcialmente (25/32), lo que implica una tasa de fallo no despreciable en estilo.
- Cero descargas y cero likes en el momento de la ficha: no hay evidencia de uso independiente ni validacion externa.
- No se documentan sesgos, idiomas soportados ni evaluaciones de alucinacion; el riesgo es desconocido.
- Licencia Apache-2.0 declarada, pero conviene verificar las licencias del tronco base y de los decodificadores enlazados antes de un uso comercial.
- Fecha de creacion posterior a la publicacion de esta ficha: tratar cualquier dato como no consolidado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Atlas3D/Qwen3.8-27B-Omni-Platos-Keys
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper v0.9 (Atlas Ingine): https://github.com/Atlas3DSS/atlas-ingine/blob/feat/zero-gradient-omni-modal-grafting/modules/zero_gradient_omni_modal_grafting/PAPER.md
- Coleccion Omni by Atlas: https://huggingface.co/collections/Atlas3D/omni-by-atlas-6b09daccd0f65e23233163b3
