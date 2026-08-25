# mlboydaisuke/bge-m3-ExecuTorch

# BGE-M3 ExecuTorch：多信号检索模型端侧部署方案

## 摘要

BGE-M3 ExecuTorch是一个将BAAI的BGE-M3模型（568M参数）转换为ExecuTorch格式的部署版本，支持在移动设备和边缘设备上运行。该模型通过一次前向传播同时输出三种检索信号——稠密向量（dense）、稀疏词法权重（sparse）和多向量（ColBERT风格）——为端侧检索应用提供了完整的解决方案。

该模型由mlboydaisuke基于BAAI/bge-m3转换而来，采用XLM-RoBERTa large架构，支持100多种语言。通过ExecuTorch的XNNPACK和Core ML后端，该模型可以在Mac等ARM设备上高效运行，Core ML版本比PyTorch eager模式快2.8倍。模型卡中特别强调了在稀疏头中进行的mask处理（上游未做），以及将上下文窗口限制为512 tokens的设计决策。

## 技术规格

| 参数 | 值 |
|---|---|
| 架构 | XLM-RoBERTa large（24层，1024维） |
| 总参数 | 568M |
| 激活参数 | 不适用（稠密模型） |
| 上下文长度 | 512 tokens（原始支持8192，此处限制为512） |
| 量化类型 | fp32（XNNPACK）、fp16（XNNPACK）、Core ML |
| 支持语言 | 100+（基于XLM-RoBERTa） |
| 许可证 | MIT |
| 权重格式 | .pte（ExecuTorch）、Core ML |

## 架构与训练

BGE-M3采用XLM-RoBERTa large架构，通过一次前向传播同时输出三种检索信号：

- **稠密向量**：CLS行，L2归一化，维度1024
- **稀疏向量**：每个token一个权重，BM25风格的词法匹配
- **多向量（ColBERT）**：每个token一个1024维向量，L2归一化，排除CLS

该模型的关键创新在于将三种检索信号融合在一次前向传播中，无需分别运行三个模型。对于部署，该版本采用ExecuTorch的XNNPACK和Core ML后端，其中Core ML版本实现了100%的子图委托，而XNNPACK fp32版本则有63.7%的委托率。

## 能力

- **稠密检索**：通过余弦相似度进行向量搜索，适用于语义匹配
- **稀疏检索**：BM25形状的词法匹配，通过token权重实现精确关键词匹配
- **多向量检索**：ColBERT风格的延迟交互，对每个query token与文档token进行最佳匹配
- **多语言支持**：基于XLM-RoBERTa，支持100+种语言
- **端侧部署**：通过ExecuTorch在移动设备上运行，无需GPU服务器
- **无前缀要求**：与E5和Qwen3-Embedding不同，bge-m3不需要添加任务前缀

## 使用场景

- **移动端语义搜索**：在手机或边缘设备上部署，实现本地文档检索。用户无需联网即可搜索本地笔记、文件或通讯记录，利用稠密向量进行语义匹配，稀疏向量处理关键词查询。

- **混合检索系统**：结合稠密和稀疏信号，实现更精准的检索。适用于企业知识库、RAG系统等场景，当用户查询包含特定术语时，稀疏信号能捕捉精确匹配，稠密信号则处理语义变体。

- **文档相似度计算**：在本地对文档进行相似度排序，用于论文查重、新闻聚类或内容推荐系统。通过多向量（ColBERT）信号捕捉文档间的细粒度语义关联。

- **低资源环境下的文本匹配**：在无GPU的嵌入式设备或边缘设备上运行，进行意图识别、实体匹配或FAQ匹配。Core ML版本在Mac上仅需64.8ms即可处理512 token序列。

- **数据去重与清洗**：在数据管道中对大规模文本进行去重，利用稠密向量计算相似度，稀疏向量快速过滤明显不相关的文档，提高处理效率。

- **隐私保护检索**：在设备端完成索引和检索，避免将数据发送到云端，适用于医疗记录、法律文件等敏感信息处理场景。

## 基准测试与性能

该模型卡提供了在Mac arm64上的性能数据，以及相对于PyTorch eager模式的加速比：

| 构建版本 | 文件大小 (MB) | 延迟 (ms) | 稠密相似度 | ColBERT相似度 | 稀疏权重偏差 |
|---|---|---|---|---|---|
| XNNPACK fp32 | 2271.5 | 233.3 | 1.000000 | 1.000000 | 0.0000 |
| Core ML | 1137.2 | **64.8** | 0.999990 | 0.999976 | 0.0008 |
| XNNPACK fp16 | 1136.3 | 484.3 | 0.999999 | 0.999998 | 0.0004 |

与原始BGE-M3模型的对比（最大绝对差异）：

| 输出 | 最大绝对差异 |
|------|------------|
| 稠密向量 | 2.645e-07 |
| 稀疏向量 | 3.427e-07 |
| ColBERT向量 | 4.061e-07 |

## 硬件要求

- **VRAM/内存**：fp32版本约2.3GB，fp16版本约1.1GB，Core ML版本约1.1GB
- **GPU**：无需GPU，可在CPU上运行
- **兼容设备**：Mac（arm64）、移动设备（iOS/Android）通过ExecuTorch
- **部署选项**：ExecuTorch运行时、Core ML、XNNPACK
- **延迟参考**：Mac arm64上Core ML版本64.8ms（512 token序列），PyTorch eager为182.8ms

## 与类似模型对比

| 模型 | 参数 | 上下文 | 检索信号 | 许可证 | 部署方式 |
|------|------|--------|----------|--------|----------|
| BGE-M3 (原始) | 568M | 8192 | 稠密+稀疏+多向量 | MIT | PyTorch |
| BGE-M3 (ExecuTorch) | 568M | 512 | 稠密+稀疏+多向量 | MIT | ExecuTorch |
| E5 | 约300M | 512 | 稠密 | MIT | PyTorch |
| Qwen3-Embedding | 约500M | 512 | 稠密 | Apache 2.0 | PyTorch |

## 限制与注意事项

- **上下文窗口限制**：模型卡明确将窗口限制为512 tokens（而非8192），对于长文档需要分块处理。
- **稀疏头mask处理**：与上游不同，此版本在图中对稀疏头进行了mask，避免将padding token的权重散落到词表槽位。
- **int8量化不可行**：由于token embedding表（1024MB）占模型权重45%，动态int8量化后体积反而大于fp16版本，因此未提供int8版本。
- **验证覆盖有限**：验证基于6个句子和2个示例句子，可能未覆盖所有边缘情况。
- **Core ML版本微小偏差**：Core ML版本与原始模型存在约0.0001的相似度偏差，对高精度场景可能需注意。

## 相关链接

- [HuggingFace模型仓库](https://huggingface.co/mlboydaisuke/bge-m3-ExecuTorch)
- [原始BGE-M3模型](https://huggingface.co/BAAI/bge-m3)
- [BGE-M3文档](https://bge-model.com/bge/bge_m3.html)
- [转换脚本仓库](https://github.com/john-rocky/executorch-models)
- [BGE-M3 GitHub](https://github.com/inferless/Bge-m3)
